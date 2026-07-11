import { describe, expect, it, vi } from "vitest";

import { benchmarkPairCandidatesForCli } from "./benchmark-pair.js";
import type { LoopSnapshot } from "../../loop/types.js";

describe("benchmark pair-candidates CLI", () => {
  it("formats the same body-free baseline and LoopRelay groups as JSON and text", () => {
    const snapshots = [
      snapshot("loop_lane", "prmt_lane", ["prmt_lane"]),
      snapshot("loop_base", "prmt_base", []),
    ];
    const json = benchmarkPairCandidatesForCli(
      { json: true, limit: "10" },
      () => snapshots,
    );
    const text = benchmarkPairCandidatesForCli({}, () => snapshots);

    expect(JSON.parse(json)).toMatchObject({
      status: "ready",
      baseline_candidates: [{ prompt_id: "prmt_base" }],
      looprelay_candidates: [{ prompt_id: "prmt_lane" }],
      privacy: {
        returns_prompt_bodies: false,
        returns_snapshot_ids: false,
        returns_outcome_summaries: false,
        returns_evidence_refs: false,
      },
    });
    expect(json).not.toContain("private outcome summary");
    expect(json).not.toContain("test:private-ref");
    expect(json).not.toContain("loop_lane");
    expect(text).toContain("benchmark pair-candidates: ready");
    expect(text).toContain("- baseline prmt_base passed; tests 2");
    expect(text).toContain("- LoopRelay prmt_lane passed; tests 2");
    expect(text).toContain(
      "Privacy: local-only; no prompt bodies, snapshot ids, raw paths, outcome summaries, or evidence refs",
    );
  });

  it("validates limits before reading snapshots", () => {
    const readSnapshots = vi.fn();

    expect(() =>
      benchmarkPairCandidatesForCli({ limit: "101" }, readSnapshots),
    ).toThrow("benchmark pair-candidates --limit must be from 1 to 100.");
    expect(readSnapshots).not.toHaveBeenCalled();
  });
});

function snapshot(
  id: string,
  promptId: string,
  usedPromptIds: string[],
): LoopSnapshot {
  return {
    id,
    created_at: "2026-07-10T00:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "project",
    project_id: "proj_candidate",
    prompt_ids: [promptId],
    event_counts: { prompts: 1, tests_run: 2 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "passed",
      summary: "private outcome summary",
      evidence_refs: ["test:private-ref"],
      ...(usedPromptIds.length > 0
        ? { used_improvement_prompt_ids: usedPromptIds }
        : {}),
    },
    next_brief: { generated: false, summary: "Continue local work." },
    privacy: {
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      local_only: true,
    },
  };
}
