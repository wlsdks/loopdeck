import type Database from "better-sqlite3";

import type { LoopSnapshot } from "../loop/types.js";
import type { LoopSnapshotListResult } from "./ports.js";

export function createLoopSnapshot(
  db: Database.Database,
  input: LoopSnapshot,
): LoopSnapshot {
  db.prepare(
    `
    INSERT OR REPLACE INTO loop_snapshots (
      id,
      created_at,
      tool,
      source,
      session_id,
      thread_id,
      cwd_label,
      project_id,
      git_root_hash,
      branch,
      worktree_label,
      prompt_ids_json,
      event_counts_json,
      quality_json,
      outcome_json,
      next_brief_json,
      privacy_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    input.id,
    input.created_at,
    input.tool,
    input.source,
    input.session_id ?? null,
    input.thread_id ?? null,
    input.cwd_label,
    input.project_id,
    input.git_root_hash ?? null,
    input.branch ?? null,
    input.worktree_label ?? null,
    JSON.stringify(input.prompt_ids),
    JSON.stringify(input.event_counts),
    JSON.stringify(input.quality),
    JSON.stringify(input.outcome),
    JSON.stringify(input.next_brief),
    JSON.stringify(input.privacy),
  );

  return input;
}

export function getLatestLoopSnapshot(
  db: Database.Database,
): LoopSnapshot | undefined {
  const row = db
    .prepare(
      "SELECT * FROM loop_snapshots ORDER BY created_at DESC, id DESC LIMIT 1",
    )
    .get() as LoopSnapshotRow | undefined;

  return row ? loopSnapshotFromRow(row) : undefined;
}

export function listLoopSnapshots(
  db: Database.Database,
  options: { limit?: number },
): LoopSnapshotListResult {
  const limit = normalizeLoopSnapshotLimit(options.limit);
  const rows = db
    .prepare(
      "SELECT * FROM loop_snapshots ORDER BY created_at DESC, id DESC LIMIT ?",
    )
    .all(limit) as LoopSnapshotRow[];

  return { items: rows.map(loopSnapshotFromRow) };
}

type LoopSnapshotRow = {
  id: string;
  created_at: string;
  tool: LoopSnapshot["tool"];
  source: LoopSnapshot["source"];
  session_id: string | null;
  thread_id: string | null;
  cwd_label: string;
  project_id: string;
  git_root_hash: string | null;
  branch: string | null;
  worktree_label: string | null;
  prompt_ids_json: string;
  event_counts_json: string;
  quality_json: string;
  outcome_json: string;
  next_brief_json: string;
  privacy_json: string;
};

function loopSnapshotFromRow(row: LoopSnapshotRow): LoopSnapshot {
  return {
    id: row.id,
    created_at: row.created_at,
    tool: row.tool,
    source: row.source,
    session_id: row.session_id ?? undefined,
    thread_id: row.thread_id ?? undefined,
    cwd_label: row.cwd_label,
    project_id: row.project_id,
    git_root_hash: row.git_root_hash ?? undefined,
    branch: row.branch ?? undefined,
    worktree_label: row.worktree_label ?? undefined,
    prompt_ids: JSON.parse(row.prompt_ids_json) as string[],
    event_counts: JSON.parse(
      row.event_counts_json,
    ) as LoopSnapshot["event_counts"],
    quality: JSON.parse(row.quality_json) as LoopSnapshot["quality"],
    outcome: JSON.parse(row.outcome_json) as LoopSnapshot["outcome"],
    next_brief: JSON.parse(row.next_brief_json) as LoopSnapshot["next_brief"],
    privacy: JSON.parse(row.privacy_json) as LoopSnapshot["privacy"],
  };
}

function normalizeLoopSnapshotLimit(limit: number | undefined): number {
  if (!limit || !Number.isInteger(limit)) {
    return 20;
  }

  return Math.min(Math.max(limit, 1), 100);
}
