import { describe, expect, it } from "vitest";

import { createBenchmarkPairCandidateReport } from "./benchmark-pair-candidates.js";
import type { LoopSnapshot } from "../loop/types.js";

describe("createBenchmarkPairCandidateReport", () => {
  it("separates safe baseline and explicitly attributed PromptLane candidates", () => {
    const report = createBenchmarkPairCandidateReport([
      snapshot({
        id: "loop_treatment",
        promptIds: ["prmt_lane", "prmt_mixed_unattributed"],
        usedPromptIds: ["prmt_lane"],
      }),
      snapshot({
        id: "loop_baseline",
        promptIds: ["prmt_base_one", "prmt_base_two"],
        status: "failed",
        usedPromptIds: [],
      }),
    ]);

    expect(report).toEqual({
      status: "ready",
      baseline_candidate_count: 2,
      promptlane_candidate_count: 1,
      baseline_candidates: [
        {
          prompt_id: "prmt_base_one",
          outcome_status: "failed",
          tests_run: 3,
          evidence_ref_count: 1,
        },
        {
          prompt_id: "prmt_base_two",
          outcome_status: "failed",
          tests_run: 3,
          evidence_ref_count: 1,
        },
      ],
      promptlane_candidates: [
        {
          prompt_id: "prmt_lane",
          outcome_status: "passed",
          tests_run: 3,
          evidence_ref_count: 1,
        },
      ],
      excluded_unsafe_candidates: 0,
      diagnostics: {
        completed_snapshots: 2,
        baseline_snapshots: 1,
        promptlane_snapshots: 1,
        evidence_complete_snapshots: 2,
        safe_snapshots: 2,
      },
      has_more: { baseline: false, promptlane: false },
      scope: { scanned_snapshots: 2, snapshot_limit: 100 },
      next_action:
        "Review one baseline and one PromptLane candidate for task equivalence, then run promptlane benchmark prepare-pair with explicit consent.",
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_snapshot_ids: false,
        returns_raw_paths: false,
        returns_outcome_summaries: false,
        returns_evidence_refs: false,
      },
    });
    expect(JSON.stringify(report)).not.toContain("prmt_mixed_unattributed");
    expect(JSON.stringify(report)).not.toContain("loop_");
  });

  it("distinguishes the missing side of a pair", () => {
    expect(
      createBenchmarkPairCandidateReport([
        snapshot({ id: "loop_lane", usedPromptIds: ["prmt_one"] }),
      ]),
    ).toMatchObject({
      status: "needs_baseline",
      baseline_candidate_count: 0,
      promptlane_candidate_count: 1,
      next_action:
        "Record a comparable completed loop without using a PromptLane improvement, then rerun pair-candidates.",
    });

    expect(
      createBenchmarkPairCandidateReport([
        snapshot({ id: "loop_base", usedPromptIds: [] }),
      ]),
    ).toMatchObject({
      status: "needs_promptlane",
      baseline_candidate_count: 1,
      promptlane_candidate_count: 0,
      next_action:
        "Use a PromptLane improvement in a comparable loop, explicitly attribute it when recording the outcome, then rerun pair-candidates.",
    });
  });

  it("keeps incomplete and unsafe outcome evidence out of both groups", () => {
    expect(
      createBenchmarkPairCandidateReport([
        snapshot({
          evidenceRefs: [],
          id: "loop_incomplete",
          usedPromptIds: [],
        }),
      ]),
    ).toMatchObject({
      status: "incomplete_outcome_evidence",
      baseline_candidate_count: 0,
      promptlane_candidate_count: 0,
    });

    const unsafe = createBenchmarkPairCandidateReport([
      snapshot({
        evidenceRefs: ["/Users/example/private/result.log"],
        id: "loop_unsafe",
        promptIds: ["prmt_private"],
        usedPromptIds: [],
      }),
    ]);
    expect(unsafe).toMatchObject({
      status: "unsafe_outcome_evidence",
      excluded_unsafe_candidates: 1,
      baseline_candidate_count: 0,
      promptlane_candidate_count: 0,
    });
    expect(JSON.stringify(unsafe)).not.toContain("/Users/example");
  });

  it("bounds and deduplicates candidates by latest classified outcome", () => {
    const report = createBenchmarkPairCandidateReport(
      [
        snapshot({
          id: "loop_latest",
          promptIds: ["prmt_one", "prmt_two"],
          usedPromptIds: [],
        }),
        snapshot({
          id: "loop_older",
          promptIds: ["prmt_one", "prmt_three"],
          usedPromptIds: ["prmt_one", "prmt_three"],
        }),
      ],
      1,
    );

    expect(report).toMatchObject({
      status: "ready",
      baseline_candidate_count: 2,
      promptlane_candidate_count: 1,
      baseline_candidates: [{ prompt_id: "prmt_one" }],
      promptlane_candidates: [{ prompt_id: "prmt_three" }],
      has_more: { baseline: true, promptlane: false },
    });
  });
});

function snapshot({
  evidenceRefs = ["test:focused"],
  id,
  promptIds = ["prmt_one"],
  status = "passed",
  usedPromptIds,
}: {
  evidenceRefs?: string[];
  id: string;
  promptIds?: string[];
  status?: LoopSnapshot["outcome"]["status"];
  usedPromptIds: string[];
}): LoopSnapshot {
  return {
    id,
    created_at: "2026-07-10T00:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "project",
    project_id: "proj_candidate",
    prompt_ids: promptIds,
    event_counts: { prompts: promptIds.length, tests_run: 3 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status,
      summary: "Candidate outcome completed.",
      evidence_refs: evidenceRefs,
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
