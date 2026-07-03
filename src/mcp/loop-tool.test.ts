import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { initializePromptCoach } from "../config/config.js";
import type { LoopSnapshot } from "../loop/types.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import {
  getLoopdeckStatusTool,
  prepareLoopBriefTool,
  recordLoopOutcomeTool,
} from "./loop-tool.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("Loopdeck MCP tools", () => {
  it("returns latest loop status without prompt bodies or raw paths", () => {
    const dataDir = seedLoopSnapshot();

    const result = getLoopdeckStatusTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      status: "ready",
      latest_snapshot: {
        id: "loop_mcp",
        tool: "codex",
        project: "private-project",
        prompt_count: 2,
        average_prompt_score: 58,
      },
      next_actions: expect.arrayContaining([
        expect.stringContaining("prepare_loop_brief"),
      ]),
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("prepares a continuation brief from the latest loop snapshot", () => {
    const dataDir = seedLoopSnapshot();

    const result = prepareLoopBriefTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      source: "latest",
      snapshot_id: "loop_mcp",
      title: "Continue agent loop loop_mcp",
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        auto_submits: false,
      },
    });
    expect(result.prompt).toContain("## Goal");
    expect(result.prompt).toContain("prompt ids: prmt_one, prmt_two");
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("returns actionable guidance when no loop snapshot exists", () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });

    const result = prepareLoopBriefTool({}, { dataDir });

    expect(result).toEqual({
      is_error: true,
      error_code: "not_found",
      message:
        "No loop snapshot found. Run `prompt-coach loop collect` first.",
    });
  });

  it("records user-approved loop outcome metadata without prompt bodies or raw paths", () => {
    const dataDir = seedLoopSnapshot();

    const result = recordLoopOutcomeTool(
      {
        snapshot_id: "loop_mcp",
        status: "passed",
        summary: "Focused MCP tests and full build passed.",
        evidence_refs: ["test:src/mcp/loop-tool.test.ts", "build:pnpm-build"],
      },
      { dataDir },
    );
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      recorded: true,
      snapshot_id: "loop_mcp",
      outcome: {
        status: "passed",
        summary: "Focused MCP tests and full build passed.",
        evidence_refs: ["test:src/mcp/loop-tool.test.ts", "build:pnpm-build"],
      },
      privacy: {
        local_only: true,
        external_calls: false,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("rejects empty loop outcome summaries", () => {
    const dataDir = seedLoopSnapshot();

    const result = recordLoopOutcomeTool(
      {
        snapshot_id: "loop_mcp",
        status: "failed",
        summary: " ",
      },
      { dataDir },
    );

    expect(result).toEqual({
      is_error: true,
      error_code: "invalid_input",
      message: "`summary` must not be empty.",
    });
  });
});

function seedLoopSnapshot(): string {
  const dataDir = createTempDir();
  const init = initializePromptCoach({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
  });
  try {
    storage.createLoopSnapshot(loopSnapshot());
  } finally {
    storage.close();
  }
  return dataDir;
}

function loopSnapshot(): LoopSnapshot {
  return {
    id: "loop_mcp",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    session_id: "session-mcp",
    cwd_label: "private-project",
    project_id: "proj_mcp",
    git_root_hash: "git_hash",
    branch: "codex/agent-loop-memory-design",
    worktree_label: "worktree-mcp",
    prompt_ids: ["prmt_one", "prmt_two"],
    event_counts: {
      prompts: 2,
    },
    quality: {
      average_prompt_score: 58,
      top_gaps: ["Goal clarity", "Verification criteria"],
      unresolved_questions: [],
    },
    outcome: {
      status: "unknown",
      summary: "Loop snapshot collected from 2 prompts.",
      evidence_refs: ["prompt:prmt_one", "prompt:prmt_two"],
    },
    next_brief: {
      generated: false,
      summary: "Run prompt-coach loop brief to generate the next request.",
    },
    privacy: {
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      local_only: true,
    },
  };
}

function createTempDir(): string {
  const dir = join(tmpdir(), `prompt-coach-loop-mcp-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
