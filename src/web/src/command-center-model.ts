import type { ArchiveScoreReport, LoopListResponse } from "./api.js";

export type CommandCenterPriority = {
  branch?: string;
  detail: string;
  evidenceCount: number;
  outcome: string;
  priority: "urgent" | "attention" | "ready";
  worktree: string;
};

export function buildCommandCenterPriorities(
  loops: LoopListResponse | undefined,
): CommandCenterPriority[] {
  const activity = loops?.status.activity;
  if (!activity) return [];

  const reviewItems = activity.command_center?.review_items;
  const candidates =
    reviewItems ??
    activity.worktrees.map((worktree) => ({
      ...worktree,
      recommendation:
        worktree.latest_outcome_status === "passed"
          ? ("ready for continuation" as const)
          : ("review before merge" as const),
      merge_readiness: {
        status:
          worktree.evidence_count === 0
            ? ("missing_evidence" as const)
            : worktree.latest_outcome_status === "passed"
              ? ("ready" as const)
              : ("needs_review" as const),
        evidence:
          worktree.evidence_count === 0
            ? ("missing evidence" as const)
            : ("evidence present" as const),
        next_action:
          worktree.evidence_count === 0
            ? ("record loop outcome evidence" as const)
            : worktree.latest_outcome_status === "passed"
              ? ("compare evidence before merge" as const)
              : ("review outcome before merge" as const),
      },
    }));

  return candidates
    .map((item) => ({
      branch: item.branch,
      detail:
        item.merge_readiness.status === "missing_evidence"
          ? "Outcome evidence is still missing."
          : item.merge_readiness.status === "needs_review"
            ? "Review the latest outcome before merging or continuing."
            : "Evidence is ready for the next continuation decision.",
      evidenceCount: item.evidence_count,
      outcome: item.latest_outcome_status.replaceAll("_", " "),
      priority: priorityForMergeStatus(item.merge_readiness.status),
      worktree: item.worktree,
    }))
    .sort(
      (left, right) =>
        priorityOrder(left.priority) - priorityOrder(right.priority),
    );
}

export function getEvidenceCoverage(
  report: ArchiveScoreReport | undefined,
): number | undefined {
  if (!report) return undefined;
  const total =
    report.effectiveness_summary.measured_prompts +
    report.effectiveness_summary.unmeasured_prompts;
  if (total === 0) return undefined;
  return Math.round(
    (report.effectiveness_summary.measured_prompts / total) * 100,
  );
}

export function getLoopHealth(
  loops: LoopListResponse | undefined,
): "ready" | "attention" | "unknown" {
  if (!loops) return "unknown";
  if (loops.status.activity.needs_review) return "attention";
  return loops.status.status === "ready" ? "ready" : "unknown";
}

function priorityOrder(priority: CommandCenterPriority["priority"]): number {
  if (priority === "urgent") return 0;
  if (priority === "attention") return 1;
  return 2;
}

function priorityForMergeStatus(
  status: "ready" | "needs_review" | "missing_evidence",
): CommandCenterPriority["priority"] {
  if (status === "missing_evidence") return "urgent";
  if (status === "needs_review") return "attention";
  return "ready";
}
