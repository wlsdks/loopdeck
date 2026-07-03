import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

import type { Command } from "commander";

import { loadHookAuth, loadPromptCoachConfig } from "../../config/config.js";
import { createLoopBrief } from "../../loop/brief.js";
import { createLoopSnapshotFromPrompts } from "../../loop/snapshot.js";
import type { LoopSnapshot } from "../../loop/types.js";
import { createProjectKey } from "../../storage/project-id.js";
import { projectLabel } from "../../storage/project-label.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { UserError } from "../user-error.js";

type LoopCliOptions = {
  branch?: string;
  cwd?: string;
  cwdPrefix?: string;
  dataDir?: string;
  json?: boolean;
  limit?: string | number;
  now?: Date;
  worktree?: string;
};

export function registerLoopCommand(program: Command): void {
  const loop = program
    .command("loop")
    .description("Collect and brief local agent loop snapshots.");

  loop
    .command("collect")
    .description("Collect a privacy-safe snapshot from recent prompt metadata.")
    .option("--data-dir <path>", "Override the prompt-coach data directory.")
    .option("--json", "Print JSON.")
    .option("--limit <count>", "Maximum recent prompts to include.")
    .option("--cwd-prefix <path>", "Only include prompts from this project/path.")
    .option("--branch <name>", "Git branch label to attach to the snapshot.")
    .option("--worktree <name>", "Worktree label to attach to the snapshot.")
    .action((options: LoopCliOptions) => {
      console.log(loopCollectForCli(options));
    });

  loop
    .command("brief")
    .description("Print a continuation prompt from the latest loop snapshot.")
    .option("--data-dir <path>", "Override the prompt-coach data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopBriefForCli(options));
    });
}

export function loopCollectForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage, hmacSecret) => {
    const cwd = options.cwd ?? process.cwd();
    const cwdPrefix = options.cwdPrefix ?? cwd;
    const prompts = storage.listPrompts({
      cwdPrefix,
      limit: parseLimit(options.limit),
    }).items;
    const snapshot = createLoopSnapshotFromPrompts({
      now: options.now ?? new Date(),
      source: "cli",
      prompts,
      project: {
        cwdLabel: projectLabel(cwdPrefix),
        projectId: createProjectKey(cwdPrefix, hmacSecret),
        gitRootHash: hashGitRoot(cwd),
        branch: options.branch ?? readGitBranch(cwd),
        worktreeLabel: options.worktree,
      },
    });
    const stored = storage.createLoopSnapshot(snapshot);

    return options.json
      ? JSON.stringify(stored, null, 2)
      : formatLoopSnapshot(stored);
  });
}

export function loopBriefForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage) => {
    const snapshot = storage.getLatestLoopSnapshot();
    if (!snapshot) {
      throw new UserError(
        "No loop snapshot found. Run `prompt-coach loop collect` first.",
      );
    }
    const brief = createLoopBrief({ snapshot });
    return options.json
      ? JSON.stringify(brief, null, 2)
      : `${brief.title}\n\n${brief.prompt}`;
  });
}

function withStorage<T>(
  dataDir: string | undefined,
  callback: (
    storage: ReturnType<typeof createSqlitePromptStorage>,
    hmacSecret: string,
  ) => T,
): T {
  const config = loadPromptCoachConfig(dataDir);
  const hookAuth = loadHookAuth(dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: hookAuth.web_session_secret,
  });

  try {
    return callback(storage, hookAuth.web_session_secret);
  } finally {
    storage.close();
  }
}

function parseLimit(value: string | number | undefined): number {
  if (value === undefined) return 20;
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new UserError("--limit must be a positive integer.");
  }
  return Math.min(parsed, 100);
}

function formatLoopSnapshot(snapshot: LoopSnapshot): string {
  return [
    "Loop snapshot collected",
    `id ${snapshot.id}`,
    `project ${snapshot.cwd_label}`,
    `tool ${snapshot.tool}`,
    `prompts ${snapshot.event_counts.prompts}`,
    snapshot.quality.average_prompt_score === undefined
      ? "average prompt score n/a"
      : `average prompt score ${snapshot.quality.average_prompt_score}/100`,
    snapshot.quality.top_gaps.length > 0
      ? `top gaps ${snapshot.quality.top_gaps.join(", ")}`
      : "top gaps none",
    "",
    "Next: prompt-coach loop brief",
    "",
    "Privacy: local-only, no prompt bodies, no raw paths.",
  ].join("\n");
}

function readGitBranch(cwd: string): string | undefined {
  try {
    const output = execFileSync("git", ["branch", "--show-current"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return output || undefined;
  } catch {
    return undefined;
  }
}

function hashGitRoot(cwd: string): string | undefined {
  try {
    const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return `git_${createHash("sha256").update(root).digest("hex").slice(0, 16)}`;
  } catch {
    return undefined;
  }
}
