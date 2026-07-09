import { detectSensitiveValues } from "../redaction/detectors.js";
import type { LoopOutcomeStatus, LoopSnapshot } from "./types.js";

const LOOP_OUTCOME_STATUSES: LoopOutcomeStatus[] = [
  "unknown",
  "in_progress",
  "passed",
  "failed",
  "blocked",
  "abandoned",
];

type LoopOutcomeInput = {
  status: unknown;
  summary: unknown;
  evidenceRefs?: unknown;
};

type LoopOutcomeInputResult =
  | { ok: true; outcome: LoopSnapshot["outcome"] }
  | { ok: false; message: string };

export function parseLoopOutcomeInput(
  input: LoopOutcomeInput,
): LoopOutcomeInputResult {
  if (!isLoopOutcomeStatus(input.status)) {
    return {
      ok: false,
      message:
        "Loop outcome status must be unknown, in_progress, passed, failed, blocked, or abandoned.",
    };
  }

  const summary = typeof input.summary === "string" ? input.summary.trim() : "";
  if (!summary) {
    return { ok: false, message: "Loop outcome summary must not be empty." };
  }

  if (
    input.evidenceRefs !== undefined &&
    (!Array.isArray(input.evidenceRefs) ||
      input.evidenceRefs.some(
        (reference) =>
          typeof reference !== "string" || reference.trim().length === 0,
      ))
  ) {
    return {
      ok: false,
      message: "Loop outcome evidence refs must be non-empty strings.",
    };
  }

  const evidenceRefs = Array.from(
    new Set((input.evidenceRefs ?? []).map((reference) => reference.trim())),
  );
  const containsSensitiveValue = [summary, ...evidenceRefs].some(
    (value) => detectSensitiveValues(value).length > 0,
  );

  if (containsSensitiveValue) {
    return {
      ok: false,
      message:
        "Loop outcome summary and evidence refs must not include secrets or raw local paths.",
    };
  }

  return {
    ok: true,
    outcome: {
      status: input.status,
      summary,
      evidence_refs: evidenceRefs,
    },
  };
}

function isLoopOutcomeStatus(value: unknown): value is LoopOutcomeStatus {
  return (
    typeof value === "string" &&
    LOOP_OUTCOME_STATUSES.includes(value as LoopOutcomeStatus)
  );
}
