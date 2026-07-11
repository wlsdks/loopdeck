import { detectSensitiveValues } from "../redaction/detectors.js";
import type { LoopSnapshot } from "../loop/types.js";

export type BenchmarkCandidateReport = {
  status:
    | "ready"
    | "no_completed_outcomes"
    | "no_attributed_outcomes"
    | "incomplete_outcome_evidence"
    | "unsafe_outcome_evidence"
    | "missing_prompt_records"
    | "empty_archive";
  candidate_count: number;
  candidates: BenchmarkCandidate[];
  excluded_unsafe_candidates: number;
  excluded_missing_candidates: number;
  diagnostics: {
    completed_snapshots: number;
    attributed_snapshots: number;
    evidence_complete_snapshots: number;
    safe_snapshots: number;
  };
  has_more: boolean;
  scope: {
    scanned_snapshots: number;
    snapshot_limit: 100;
  };
  next_action: string;
  privacy: {
    local_only: true;
    external_calls: false;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    returns_evidence_refs: false;
  };
};

type BenchmarkCandidate = {
  prompt_id: string;
  snapshot_id: string;
  outcome_status: "passed" | "failed";
  tests_run: number;
  evidence_ref_count: number;
};

const SNAPSHOT_LIMIT = 100;
const DEFAULT_CANDIDATE_LIMIT = 20;

export function createBenchmarkCandidateReport(
  snapshots: LoopSnapshot[],
  requestedLimit = DEFAULT_CANDIDATE_LIMIT,
  promptExists: (promptId: string) => boolean = () => true,
): BenchmarkCandidateReport {
  const candidatesByPromptId = new Map<string, BenchmarkCandidate>();
  const unsafePromptIds = new Set<string>();
  const missingPromptIds = new Set<string>();
  const diagnostics = {
    completed_snapshots: 0,
    attributed_snapshots: 0,
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
    const usedPromptIds = Array.from(
      new Set(snapshot.outcome.used_improvement_prompt_ids ?? []),
    ).filter((promptId) => snapshot.prompt_ids.includes(promptId));
    if (usedPromptIds.length === 0) continue;
    diagnostics.attributed_snapshots += 1;

    const evidenceIsComplete =
      snapshot.outcome.summary.trim().length > 0 &&
      snapshot.outcome.evidence_refs.length > 0;
    if (!evidenceIsComplete) continue;
    diagnostics.evidence_complete_snapshots += 1;
    const evidenceIsUnsafe = [
      snapshot.outcome.summary,
      ...snapshot.outcome.evidence_refs,
    ].some((value) => detectSensitiveValues(value).length > 0);
    if (!evidenceIsUnsafe) diagnostics.safe_snapshots += 1;

    for (const promptId of usedPromptIds) {
      if (candidatesByPromptId.has(promptId)) continue;
      if (evidenceIsUnsafe) {
        unsafePromptIds.add(promptId);
        continue;
      }
      if (!promptExists(promptId)) {
        missingPromptIds.add(promptId);
        continue;
      }
      unsafePromptIds.delete(promptId);
      missingPromptIds.delete(promptId);
      candidatesByPromptId.set(promptId, {
        prompt_id: promptId,
        snapshot_id: snapshot.id,
        outcome_status: snapshot.outcome.status,
        tests_run: snapshot.event_counts.tests_run ?? 0,
        evidence_ref_count: snapshot.outcome.evidence_refs.length,
      });
    }
  }

  const allCandidates = Array.from(candidatesByPromptId.values());
  const limit = clampLimit(requestedLimit);
  const status = candidateStatus(
    scopedSnapshots.length,
    allCandidates.length,
    diagnostics,
    missingPromptIds.size,
  );

  return {
    status,
    candidate_count: allCandidates.length,
    candidates: allCandidates.slice(0, limit),
    excluded_unsafe_candidates: Array.from(unsafePromptIds).filter(
      (promptId) => !candidatesByPromptId.has(promptId),
    ).length,
    excluded_missing_candidates: Array.from(missingPromptIds).filter(
      (promptId) => !candidatesByPromptId.has(promptId),
    ).length,
    diagnostics,
    has_more: allCandidates.length > limit,
    scope: {
      scanned_snapshots: Math.min(snapshots.length, SNAPSHOT_LIMIT),
      snapshot_limit: SNAPSHOT_LIMIT,
    },
    next_action: nextAction(status),
    privacy: {
      local_only: true,
      external_calls: false,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
      returns_evidence_refs: false,
    },
  };
}

function candidateStatus(
  snapshotCount: number,
  candidateCount: number,
  diagnostics: BenchmarkCandidateReport["diagnostics"],
  missingPromptCount: number,
): BenchmarkCandidateReport["status"] {
  if (snapshotCount === 0) return "empty_archive";
  if (candidateCount > 0) return "ready";
  if (diagnostics.completed_snapshots === 0) return "no_completed_outcomes";
  if (diagnostics.attributed_snapshots === 0) {
    return "no_attributed_outcomes";
  }
  if (diagnostics.evidence_complete_snapshots === 0) {
    return "incomplete_outcome_evidence";
  }
  if (missingPromptCount > 0 && diagnostics.safe_snapshots > 0) {
    return "missing_prompt_records";
  }
  return "unsafe_outcome_evidence";
}

function clampLimit(limit: number): number {
  if (!Number.isInteger(limit)) return DEFAULT_CANDIDATE_LIMIT;
  return Math.min(Math.max(limit, 1), 100);
}

function nextAction(status: BenchmarkCandidateReport["status"]): string {
  if (status === "ready") {
    return "Review candidate prompt ids, then run looprelay benchmark prepare-fixture with explicit consent.";
  }
  if (status === "empty_archive") {
    return "Collect a loop snapshot after using LoopRelay with Codex or Claude Code.";
  }
  if (status === "no_completed_outcomes") {
    return "Run looprelay loop status, then record the latest snapshot outcome after a verifiable checkpoint.";
  }
  if (status === "no_attributed_outcomes") {
    return "Record improvement attribution only if a LoopRelay improvement was actually used; otherwise collect another verified loop.";
  }
  if (status === "incomplete_outcome_evidence") {
    return "Record at least one privacy-safe evidence ref on an attributed passed or failed outcome.";
  }
  if (status === "missing_prompt_records") {
    return "Rebuild the local prompt index or collect a new verified loop whose prompt record is still available.";
  }
  return "Replace sensitive outcome evidence with privacy-safe labels before preparing a benchmark fixture.";
}
