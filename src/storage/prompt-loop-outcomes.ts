import { detectSensitiveValues } from "../redaction/detectors.js";
import type {
  PromptEffectiveness,
  PromptLoopOutcomeEvidence,
} from "./ports.js";
import type { LoopSnapshotListResult } from "./ports.js";

export function promptLoopOutcomesForPrompt(
  snapshots: LoopSnapshotListResult["items"],
  promptId: string,
): PromptLoopOutcomeEvidence[] {
  return snapshots
    .filter((snapshot) => snapshot.prompt_ids.includes(promptId))
    .filter((snapshot) => snapshot.outcome.status !== "unknown")
    .map((snapshot) => ({
      snapshot_id: snapshot.id,
      status: snapshot.outcome.status,
      summary: redactOutcomeEvidenceText(snapshot.outcome.summary),
      evidence_refs: snapshot.outcome.evidence_refs.filter(isSafeEvidenceRef),
      improvement_used:
        snapshot.outcome.used_improvement_prompt_ids?.includes(promptId) ??
        false,
      ...(snapshot.event_counts.tests_run !== undefined
        ? { tests_run: snapshot.event_counts.tests_run }
        : {}),
    }))
    .filter(
      (outcome) =>
        outcome.summary.length > 0 || outcome.evidence_refs.length > 0,
    )
    .slice(0, 5);
}

export function promptEffectivenessForOutcomes(
  outcomes: PromptLoopOutcomeEvidence[],
): PromptEffectiveness | undefined {
  if (outcomes.length === 0) return undefined;

  const attributed = outcomes.filter((outcome) => outcome.improvement_used);
  const passed = attributed.filter((outcome) => outcome.status === "passed");
  const failed = attributed.filter((outcome) => outcome.status === "failed");
  const testsRun = attributed.reduce(
    (total, outcome) => total + (outcome.tests_run ?? 0),
    0,
  );
  const evidenceRefs = uniqueEvidenceRefs(
    attributed.flatMap((outcome) => outcome.evidence_refs),
  );
  const verdict =
    passed.length > 0 && failed.length === 0
      ? "proven"
      : failed.length > 0
        ? "mixed"
        : "unproven";

  return {
    verdict,
    summary: effectivenessSummary(
      verdict,
      testsRun,
      attributed.length,
      outcomes,
    ),
    calibration: {
      linked_outcomes: outcomes.length,
      attributed_outcomes: attributed.length,
      passing_outcomes: passed.length,
      failing_outcomes: failed.length,
      total_tests_run: testsRun,
    },
    evidence_refs: evidenceRefs,
  };
}

function isSafeEvidenceRef(ref: string): boolean {
  const trimmed = ref.trim();
  return trimmed.length > 0 && detectSensitiveValues(trimmed).length === 0;
}

function redactOutcomeEvidenceText(value: string): string {
  const findings = detectSensitiveValues(value);
  if (findings.length === 0) return value;

  let redacted = value;
  for (const finding of [...findings].reverse()) {
    redacted = `${redacted.slice(0, finding.range_start)}${finding.replacement}${redacted.slice(finding.range_end)}`;
  }
  return redacted;
}

function effectivenessSummary(
  verdict: PromptEffectiveness["verdict"],
  testsRun: number,
  attributedOutcomeCount: number,
  linkedOutcomes: PromptLoopOutcomeEvidence[],
): string {
  if (attributedOutcomeCount === 0) {
    const linkedPassed = linkedOutcomes.some(
      (outcome) => outcome.status === "passed",
    );
    return linkedPassed
      ? "The linked loop passed, but use of this LoopRelay improvement was not recorded."
      : "A loop outcome is linked, but use of this LoopRelay improvement was not recorded.";
  }

  const status =
    verdict === "proven"
      ? "passed"
      : verdict === "mixed"
        ? "has mixed results"
        : "has no passing outcome yet";
  const testCopy = testsRun === 1 ? "1 test" : `${testsRun} tests`;
  const outcomeCopy =
    attributedOutcomeCount === 1
      ? "1 outcome"
      : `${attributedOutcomeCount} outcomes`;

  return `Attributed improvement evidence ${status} with ${testCopy} across ${outcomeCopy}.`;
}

function uniqueEvidenceRefs(refs: string[]): string[] {
  return Array.from(new Set(refs)).slice(0, 5);
}
