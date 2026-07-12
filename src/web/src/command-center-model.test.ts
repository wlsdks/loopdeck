import { describe, expect, it } from "vitest";

import type { ArchiveScoreReport, LoopListResponse } from "./api.js";
import {
  buildCommandCenterPriorities,
  getEvidenceCoverage,
  getLoopHealth,
} from "./command-center-model.js";

const loops = {
  status: {
    status: "ready",
    activity: {
      needs_review: true,
      worktrees: [],
      command_center: {
        review_items: [
          {
            worktree: "ready-worktree",
            branch: "feat/ready",
            latest_outcome_status: "passed",
            evidence_count: 2,
            merge_readiness: { status: "ready" },
          },
          {
            worktree: "missing-worktree",
            latest_outcome_status: "blocked",
            evidence_count: 0,
            merge_readiness: { status: "missing_evidence" },
          },
        ],
      },
    },
  },
} as unknown as LoopListResponse;

describe("command center model", () => {
  it("puts missing-evidence worktrees ahead of ready continuations", () => {
    expect(buildCommandCenterPriorities(loops)).toMatchObject([
      { priority: "urgent", worktree: "missing-worktree" },
      { priority: "ready", worktree: "ready-worktree" },
    ]);
  });

  it("makes loop health conservative when review is required", () => {
    expect(getLoopHealth(loops)).toBe("attention");
    expect(getLoopHealth(undefined)).toBe("unknown");
  });

  it("reports evidence coverage only when a meaningful denominator exists", () => {
    const report = {
      effectiveness_summary: {
        measured_prompts: 6,
        unmeasured_prompts: 4,
      },
    } as ArchiveScoreReport;
    expect(getEvidenceCoverage(report)).toBe(60);
    expect(
      getEvidenceCoverage({
        effectiveness_summary: { measured_prompts: 0, unmeasured_prompts: 0 },
      } as ArchiveScoreReport),
    ).toBeUndefined();
  });
});
