import { detectSensitiveValues } from "../redaction/detectors.js";
import type { LoopSnapshot } from "../loop/types.js";

type PairCandidateStatus =
  | "ready"
  | "needs_baseline"
  | "needs_looprelay"
  | "no_completed_outcomes"
  | "incomplete_outcome_evidence"
  | "unsafe_outcome_evidence"
  | "empty_archive";

type PairCandidate = {
  prompt_id: string;
  outcome_status: "passed" | "failed";
  tests_run: number;
  evidence_ref_count: number;
};

export type BenchmarkPairCandidateReport = {
  status: PairCandidateStatus;
  baseline_candidate_count: number;
  looprelay_candidate_count: number;
  baseline_candidates: PairCandidate[];
  looprelay_candidates: PairCandidate[];
  excluded_unsafe_candidates: number;
  diagnostics: {
    completed_snapshots: number;
    baseline_snapshots: number;
    looprelay_snapshots: number;
    evidence_complete_snapshots: number;
    safe_snapshots: number;
  };
  has_more: { baseline: boolean; looprelay: boolean };
  scope: { scanned_snapshots: number; snapshot_limit: 100 };
  next_action: string;
  privacy: {
    local_only: true;
    external_calls: false;
    returns_prompt_bodies: false;
    returns_snapshot_ids: false;
    returns_raw_paths: false;
    returns_outcome_summaries: false;
    returns_evidence_refs: false;
  };
};

const SNAPSHOT_LIMIT = 100;
const DEFAULT_CANDIDATE_LIMIT = 20;

export function createBenchmarkPairCandidateReport(
  snapshots: LoopSnapshot[],
  requestedLimit = DEFAULT_CANDIDATE_LIMIT,
): BenchmarkPairCandidateReport {
  const baselineCandidates: PairCandidate[] = [];
  const looprelayCandidates: PairCandidate[] = [];
  const seenPromptIds = new Set<string>();
  let excludedUnsafeCandidates = 0;
  const diagnostics = {
    completed_snapshots: 0,
    baseline_snapshots: 0,
    looprelay_snapshots: 0,
    evidence_complete_snapshots: 0,
    safe_snapshots: 0,
  };
  const scopedSnapshots = snapshots.slice(0, SNAPSHOT_LIMIT);

  for (const snapshot of scopedSnapshots) {
    if (
      snapshot.outcome.status !== "passed" &&
      snapshot.outcome.status !== "failed"
    ) {
      continue;
    }
    diagnostics.completed_snapshots += 1;
    const latestPromptIds = Array.from(new Set(snapshot.prompt_ids)).filter(
      (promptId) => !seenPromptIds.has(promptId),
    );
    for (const promptId of latestPromptIds) seenPromptIds.add(promptId);

    const usedPromptIds = Array.from(
      new Set(snapshot.outcome.used_improvement_prompt_ids ?? []),
    ).filter((promptId) => latestPromptIds.includes(promptId));
    const isBaseline =
      (snapshot.outcome.used_improvement_prompt_ids ?? []).length === 0;
    const candidatePromptIds = isBaseline ? latestPromptIds : usedPromptIds;
    if (isBaseline) diagnostics.baseline_snapshots += 1;
    else diagnostics.looprelay_snapshots += 1;

    const evidenceIsComplete =
      snapshot.outcome.summary.trim().length > 0 &&
      snapshot.outcome.evidence_refs.length > 0;
    if (!evidenceIsComplete) continue;
    diagnostics.evidence_complete_snapshots += 1;
    const evidenceIsUnsafe = [
      snapshot.outcome.summary,
      ...snapshot.outcome.evidence_refs,
    ].some((value) => detectSensitiveValues(value).length > 0);
    const safePromptIds = candidatePromptIds.filter(isSafePromptId);
    excludedUnsafeCandidates +=
      candidatePromptIds.length - safePromptIds.length;
    if (evidenceIsUnsafe) {
      excludedUnsafeCandidates += safePromptIds.length;
      continue;
    }
    if (safePromptIds.length > 0) diagnostics.safe_snapshots += 1;

    const target = isBaseline ? baselineCandidates : looprelayCandidates;
    for (const promptId of safePromptIds) {
      target.push({
        prompt_id: promptId,
        outcome_status: snapshot.outcome.status,
        tests_run: snapshot.event_counts.tests_run ?? 0,
        evidence_ref_count: snapshot.outcome.evidence_refs.length,
      });
    }
  }

  const limit = clampLimit(requestedLimit);
  const status = pairCandidateStatus({
    snapshotCount: scopedSnapshots.length,
    baselineCount: baselineCandidates.length,
    looprelayCount: looprelayCandidates.length,
    diagnostics,
  });
  return {
    status,
    baseline_candidate_count: baselineCandidates.length,
    looprelay_candidate_count: looprelayCandidates.length,
    baseline_candidates: baselineCandidates.slice(0, limit),
    looprelay_candidates: looprelayCandidates.slice(0, limit),
    excluded_unsafe_candidates: excludedUnsafeCandidates,
    diagnostics,
    has_more: {
      baseline: baselineCandidates.length > limit,
      looprelay: looprelayCandidates.length > limit,
    },
    scope: {
      scanned_snapshots: Math.min(snapshots.length, SNAPSHOT_LIMIT),
      snapshot_limit: SNAPSHOT_LIMIT,
    },
    next_action: pairCandidateNextAction(status),
    privacy: {
      local_only: true,
      external_calls: false,
      returns_prompt_bodies: false,
      returns_snapshot_ids: false,
      returns_raw_paths: false,
      returns_outcome_summaries: false,
      returns_evidence_refs: false,
    },
  };
}

function pairCandidateStatus({
  snapshotCount,
  baselineCount,
  looprelayCount,
  diagnostics,
}: {
  snapshotCount: number;
  baselineCount: number;
  looprelayCount: number;
  diagnostics: BenchmarkPairCandidateReport["diagnostics"];
}): PairCandidateStatus {
  if (snapshotCount === 0) return "empty_archive";
  if (baselineCount > 0 && looprelayCount > 0) return "ready";
  if (baselineCount === 0 && looprelayCount > 0) return "needs_baseline";
  if (baselineCount > 0) return "needs_looprelay";
  if (diagnostics.completed_snapshots === 0) return "no_completed_outcomes";
  if (diagnostics.evidence_complete_snapshots === 0) {
    return "incomplete_outcome_evidence";
  }
  return "unsafe_outcome_evidence";
}

function pairCandidateNextAction(status: PairCandidateStatus): string {
  if (status === "ready") {
    return "Review one baseline and one LoopRelay candidate for task equivalence, then run looprelay benchmark prepare-pair with explicit consent.";
  }
  if (status === "needs_baseline") {
    return "Record a comparable completed loop without using a LoopRelay improvement, then rerun pair-candidates.";
  }
  if (status === "needs_looprelay") {
    return "Use a LoopRelay improvement in a comparable loop, explicitly attribute it when recording the outcome, then rerun pair-candidates.";
  }
  if (status === "empty_archive") {
    return "Collect baseline and LoopRelay loop snapshots before preparing a paired benchmark.";
  }
  if (status === "no_completed_outcomes") {
    return "Record passed or failed outcomes after verifiable checkpoints, then rerun pair-candidates.";
  }
  if (status === "incomplete_outcome_evidence") {
    return "Add a redacted outcome summary and at least one privacy-safe evidence ref before preparing a pair.";
  }
  return "Replace sensitive outcome evidence or malformed prompt ids before preparing a pair.";
}

function isSafePromptId(value: string): boolean {
  return /^prmt_[A-Za-z0-9_-]+$/.test(value);
}

function clampLimit(value: number): number {
  if (!Number.isInteger(value)) return DEFAULT_CANDIDATE_LIMIT;
  return Math.min(Math.max(value, 1), 100);
}
