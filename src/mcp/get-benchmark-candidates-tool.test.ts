import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import { initializeLoopRelay } from "../config/config.js";
import { normalizeCodexPayload } from "../adapters/codex.js";
import type { LoopSnapshot } from "../loop/types.js";
import { redactPrompt } from "../redaction/redact.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import { getBenchmarkCandidatesTool } from "./get-benchmark-candidates-tool.js";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("get_benchmark_candidates MCP tool", () => {
  it("returns body-free readiness candidates from local snapshots", async () => {
    const dataDir = createTempDir();
    const init = initializeLoopRelay({ dataDir });
    const storage = createSqlitePromptStorage({
      dataDir,
      hmacSecret: init.hookAuth.web_session_secret,
    });
    const event = normalizeCodexPayload({
      session_id: "session-benchmark",
      cwd: "/private/project",
      hook_event_name: "UserPromptSubmit",
      prompt: "Inspect the focused behavior.",
    });
    const stored = await storage.storePrompt({
      event,
      redaction: redactPrompt(event.prompt, "mask"),
    });
    storage.createLoopSnapshot(snapshot(stored.id));
    storage.close();

    const result = getBenchmarkCandidatesTool({ limit: 10 }, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      status: "ready",
      candidate_count: 1,
      candidates: [
        {
          prompt_id: stored.id,
          snapshot_id: "loop_mcp_candidate",
          outcome_status: "passed",
        },
      ],
      diagnostics: {
        completed_snapshots: 1,
        attributed_snapshots: 1,
        evidence_complete_snapshots: 1,
        safe_snapshots: 1,
      },
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        returns_evidence_refs: false,
      },
    });
    expect(serialized).not.toContain("Private outcome summary");
    expect(serialized).not.toContain("test:private-ref");
  });

  it("rejects invalid limits before accessing local storage", () => {
    expect(getBenchmarkCandidatesTool({ limit: 101 })).toEqual({
      is_error: true,
      error_code: "invalid_input",
      message: "get_benchmark_candidates limit must be from 1 to 100.",
    });
  });
});

function createTempDir(): string {
  const dir = join(tmpdir(), `looprelay-mcp-benchmark-${randomUUID()}`);
  tempDirs.push(dir);
  return dir;
}

function snapshot(promptId: string): LoopSnapshot {
  return {
    id: "loop_mcp_candidate",
    created_at: "2026-07-10T00:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "private-project",
    project_id: "proj_mcp_candidate",
    prompt_ids: [promptId],
    event_counts: { prompts: 1, tests_run: 2 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "passed",
      summary: "Private outcome summary",
      evidence_refs: ["test:private-ref"],
      used_improvement_prompt_ids: [promptId],
    },
    next_brief: { generated: false, summary: "Continue local work." },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
  };
}
