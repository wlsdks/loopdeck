import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import type { LoopSnapshot } from "../loop/types.js";
import { createSqlitePromptStorage } from "./sqlite.js";

const dirs: string[] = [];
afterEach(() =>
  dirs
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true })),
);

describe("loop close storage", () => {
  it("atomically records typed outcome evidence and exact receipt use", () => {
    const storage = fixture();
    const receipt = storage.recordContinuationReceipt({
      snapshot_id: "loop_close",
    });
    const closed = storage.closeLoop({
      snapshot_id: "loop_close",
      outcome: {
        status: "passed",
        summary: "Focused receipt verification passed.",
        evidence_refs: ["test:focused"],
        typed_evidence: [
          {
            kind: "test",
            label: "focused receipt verification",
            observed_at: "2026-07-12T03:00:00.000Z",
            result: "passed",
            verification: "locally_verified",
            head_hash: "83b1c6f2",
          },
        ],
      },
      receipt: {
        id: receipt.id,
        update: {
          status: "followed",
          target_correct: true,
          first_action_correct: true,
          first_value_seconds: 8,
          friction_score: 0,
        },
      },
    });

    expect(closed).toMatchObject({
      snapshot: {
        id: "loop_close",
        outcome: {
          status: "passed",
          typed_evidence: [
            expect.objectContaining({
              kind: "test",
              result: "passed",
              verification: "locally_verified",
            }),
          ],
        },
      },
      receipt: { id: receipt.id, status: "followed" },
    });
    storage.close();
  });

  it("rolls back the outcome when the receipt belongs to another snapshot", () => {
    const storage = fixture();
    storage.createLoopSnapshot(snapshot({ id: "loop_other" }));
    const receipt = storage.recordContinuationReceipt({
      snapshot_id: "loop_other",
    });

    expect(() =>
      storage.closeLoop({
        snapshot_id: "loop_close",
        outcome: {
          status: "passed",
          summary: "This must roll back.",
          evidence_refs: [],
        },
        receipt: { id: receipt.id, update: { status: "followed" } },
      }),
    ).toThrow("must belong to the selected loop snapshot");
    expect(storage.getLatestLoopSnapshot()?.outcome.status).toBe("unknown");
    storage.close();
  });
});

function fixture() {
  const dataDir = join(tmpdir(), `looprelay-close-${randomUUID()}`);
  dirs.push(dataDir);
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: "test-secret",
    now: () => new Date("2026-07-12T03:00:00.000Z"),
  });
  storage.createLoopSnapshot(snapshot());
  return storage;
}

function snapshot(patch: Partial<LoopSnapshot> = {}): LoopSnapshot {
  return {
    id: "loop_close",
    created_at: "2026-07-12T02:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "close-project",
    project_id: "proj_close",
    prompt_ids: [],
    event_counts: { prompts: 0 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: { status: "unknown", summary: "Open.", evidence_refs: [] },
    next_brief: { generated: false, summary: "Prepare brief." },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
    ...patch,
  };
}
