import type { LoopSnapshot } from "./types.js";

export type LoopMemoryCandidateDecision = {
  eligible: boolean;
  reason:
    | "passed_with_evidence"
    | "outcome_not_passed"
    | "missing_evidence"
    | "missing_summary"
    | "unsafe_summary";
  snapshot_id: string;
  candidate?: {
    title: string;
    scope: "project";
    statement: string;
    evidence_refs: string[];
  };
  privacy: {
    local_only: true;
    external_calls: false;
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    auto_writes_memory: false;
  };
};

export function decideLoopMemoryCandidate(
  snapshot: LoopSnapshot,
): LoopMemoryCandidateDecision {
  const base = {
    snapshot_id: snapshot.id,
    privacy: memoryCandidatePrivacy(),
  };

  if (snapshot.outcome.status !== "passed") {
    return {
      ...base,
      eligible: false,
      reason: "outcome_not_passed",
    };
  }

  if (snapshot.outcome.evidence_refs.length === 0) {
    return {
      ...base,
      eligible: false,
      reason: "missing_evidence",
    };
  }

  const summary = snapshot.outcome.summary.trim();
  if (!summary) {
    return {
      ...base,
      eligible: false,
      reason: "missing_summary",
    };
  }

  if (looksUnsafe(summary)) {
    return {
      ...base,
      eligible: false,
      reason: "unsafe_summary",
    };
  }

  return {
    ...base,
    eligible: true,
    reason: "passed_with_evidence",
    candidate: {
      title: `Remember loop outcome for ${snapshot.cwd_label}`,
      scope: "project",
      statement: summary,
      evidence_refs: snapshot.outcome.evidence_refs,
    },
  };
}

function memoryCandidatePrivacy(): LoopMemoryCandidateDecision["privacy"] {
  return {
    local_only: true,
    external_calls: false,
    stores_prompt_bodies: false,
    stores_raw_paths: false,
    auto_writes_memory: false,
  };
}

function looksUnsafe(value: string): boolean {
  return (
    /(?:^|\s)\/Users\/[^\s]+/.test(value) ||
    /(?:^|\s)\/home\/[^\s]+/.test(value) ||
    /sk-[a-z0-9_-]{6,}/i.test(value) ||
    /gh[pousr]_[a-z0-9_]{12,}/i.test(value)
  );
}
