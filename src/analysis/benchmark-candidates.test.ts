import { describe, expect, it } from "vitest";

import { createBenchmarkCandidateReport } from "./benchmark-candidates.js";
import type { LoopSnapshot } from "../loop/types.js";

describe("createBenchmarkCandidateReport", () => {
  it("returns bounded deduplicated candidates from safe attributed completed outcomes", () => {
    const report = createBenchmarkCandidateReport(
      [
        snapshot({
          id: "loop_latest",
          promptIds: ["prmt_one", "prmt_two"],
          usedPromptIds: ["prmt_one", "prmt_two"],
        }),
        snapshot({
          id: "loop_older",
          promptIds: ["prmt_one", "prmt_three"],
          status: "failed",
          usedPromptIds: ["prmt_one", "prmt_three"],
        }),
      ],
      2,
      () => true,
    );

    expect(report).toEqual({
      status: "ready",
      candidate_count: 3,
      candidates: [
        {
          prompt_id: "prmt_one",
          snapshot_id: "loop_latest",
          outcome_status: "passed",
          tests_run: 3,
          evidence_ref_count: 1,
        },
        {
          prompt_id: "prmt_two",
          snapshot_id: "loop_latest",
          outcome_status: "passed",
          tests_run: 3,
          evidence_ref_count: 1,
        },
      ],
      excluded_unsafe_candidates: 0,
      excluded_missing_candidates: 0,
      diagnostics: {
        completed_snapshots: 2,
        attributed_snapshots: 2,
        evidence_complete_snapshots: 2,
        safe_snapshots: 2,
      },
      has_more: true,
      scope: {
        scanned_snapshots: 2,
        snapshot_limit: 100,
      },
      next_action:
        "Review candidate prompt ids, then run looprelay benchmark prepare-fixture with explicit consent.",
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        returns_evidence_refs: false,
      },
    });
    expect(JSON.stringify(report)).not.toContain("outcome passed");
  });

  it("distinguishes archives without completed outcomes", () => {
    const report = createBenchmarkCandidateReport([
      snapshot({ id: "loop_in_progress", status: "in_progress" }),
    ]);

    expect(report).toMatchObject({
      status: "no_completed_outcomes",
      candidate_count: 0,
      diagnostics: {
        completed_snapshots: 0,
        attributed_snapshots: 0,
        evidence_complete_snapshots: 0,
        safe_snapshots: 0,
      },
      next_action:
        "Run looprelay loop status, then record the latest snapshot outcome after a verifiable checkpoint.",
    });
  });

  it("distinguishes completed outcomes without explicit improvement attribution", () => {
    expect(
      createBenchmarkCandidateReport([
        snapshot({ id: "loop_unattributed", usedPromptIds: [] }),
      ]),
    ).toMatchObject({
      status: "no_attributed_outcomes",
      diagnostics: {
        completed_snapshots: 1,
        attributed_snapshots: 0,
        evidence_complete_snapshots: 0,
        safe_snapshots: 0,
      },
      next_action:
        "Record improvement attribution only if a LoopRelay improvement was actually used; otherwise collect another verified loop.",
    });
  });

  it("distinguishes attributed outcomes with incomplete evidence", () => {
    expect(
      createBenchmarkCandidateReport([
        snapshot({ id: "loop_incomplete", evidenceRefs: [] }),
      ]),
    ).toMatchObject({
      status: "incomplete_outcome_evidence",
      diagnostics: {
        completed_snapshots: 1,
        attributed_snapshots: 1,
        evidence_complete_snapshots: 0,
        safe_snapshots: 0,
      },
      next_action:
        "Record at least one privacy-safe evidence ref on an attributed passed or failed outcome.",
    });
  });

  it("distinguishes attributed outcomes whose evidence is unsafe", () => {
    const report = createBenchmarkCandidateReport([
      snapshot({
        evidenceRefs: ["/Users/example/private/result.log"],
        id: "loop_unsafe",
      }),
    ]);

    expect(report).toMatchObject({
      status: "unsafe_outcome_evidence",
      excluded_unsafe_candidates: 1,
      diagnostics: {
        completed_snapshots: 1,
        attributed_snapshots: 1,
        evidence_complete_snapshots: 1,
        safe_snapshots: 0,
      },
      next_action:
        "Replace sensitive outcome evidence with privacy-safe labels before preparing a benchmark fixture.",
    });
    expect(JSON.stringify(report)).not.toContain("/Users/example");
  });

  it("distinguishes an empty snapshot archive", () => {
    expect(createBenchmarkCandidateReport([])).toMatchObject({
      status: "empty_archive",
      candidate_count: 0,
      scope: { scanned_snapshots: 0, snapshot_limit: 100 },
      next_action:
        "Collect a loop snapshot after using LoopRelay with Codex or Claude Code.",
    });
  });

  it("excludes snapshot-only prompt ids that are missing from the live archive", () => {
    const report = createBenchmarkCandidateReport(
      [
        snapshot({
          id: "loop_orphans",
          promptIds: ["prmt_present", "prmt_orphan"],
          usedPromptIds: ["prmt_present", "prmt_orphan"],
        }),
      ],
      20,
      (promptId) => promptId === "prmt_present",
    );

    expect(report).toMatchObject({
      status: "ready",
      candidate_count: 1,
      candidates: [{ prompt_id: "prmt_present" }],
      excluded_missing_candidates: 1,
    });
    expect(JSON.stringify(report)).not.toContain("prmt_orphan");

    expect(
      createBenchmarkCandidateReport(
        [snapshot({ id: "loop_orphan_only" })],
        20,
        () => false,
      ),
    ).toMatchObject({
      status: "missing_prompt_records",
      candidate_count: 0,
      excluded_missing_candidates: 1,
      next_action:
        "Rebuild the local prompt index or collect a new verified loop whose prompt record is still available.",
    });
  });
});

function snapshot({
  evidenceRefs = ["test:focused"],
  id = "loop_candidate",
  promptIds = ["prmt_one"],
  status = "passed",
  usedPromptIds = ["prmt_one"],
}: {
  evidenceRefs?: string[];
  id?: string;
  promptIds?: string[];
  status?: LoopSnapshot["outcome"]["status"];
  usedPromptIds?: string[];
} = {}): LoopSnapshot {
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
      summary: "Candidate outcome passed.",
      evidence_refs: evidenceRefs,
      used_improvement_prompt_ids: usedPromptIds,
    },
    next_brief: { generated: false, summary: "Continue local work." },
    privacy: {
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      local_only: true,
    },
  };
}
