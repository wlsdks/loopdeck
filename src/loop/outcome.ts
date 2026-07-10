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
  usedImprovementPromptIds?: unknown;
};

type LoopOutcomeInputResult =
  | { ok: true; outcome: LoopSnapshot["outcome"] }
  | { ok: false; message: string };

export class LoopOutcomeAttributionError extends Error {
  constructor() {
    super(
      "Used improvement prompt ids must belong to the selected loop snapshot.",
    );
    this.name = "LoopOutcomeAttributionError";
  }
}

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

  if (
    input.usedImprovementPromptIds !== undefined &&
    (!Array.isArray(input.usedImprovementPromptIds) ||
      input.usedImprovementPromptIds.some(
        (promptId) =>
          typeof promptId !== "string" || promptId.trim().length === 0,
      ))
  ) {
    return {
      ok: false,
      message: "Used improvement prompt ids must be non-empty strings.",
    };
  }

  const usedImprovementPromptIds = Array.from(
    new Set(
      (input.usedImprovementPromptIds ?? []).map((promptId) => promptId.trim()),
    ),
  );
  const containsSensitiveValue = [
    summary,
    ...evidenceRefs,
    ...usedImprovementPromptIds,
  ].some((value) => detectSensitiveValues(value).length > 0);

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
      ...(usedImprovementPromptIds.length > 0
        ? { used_improvement_prompt_ids: usedImprovementPromptIds }
        : {}),
    },
  };
}

function isLoopOutcomeStatus(value: unknown): value is LoopOutcomeStatus {
  return (
    typeof value === "string" &&
    LOOP_OUTCOME_STATUSES.includes(value as LoopOutcomeStatus)
  );
}
