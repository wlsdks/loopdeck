import { detectSensitiveValues } from "../redaction/detectors.js";

export type LoopEvidence = {
  kind: "test" | "commit" | "build" | "review" | "external";
  label: string;
  observed_at: string;
  result: "passed" | "failed" | "unknown";
  verification: "declared" | "locally_verified";
  head_hash?: string;
};

export type LoopEvidenceParseResult =
  | { ok: true; evidence: LoopEvidence[] }
  | { ok: false; message: string };

export function parseLoopEvidence(value: unknown): LoopEvidenceParseResult {
  if (value === undefined) return { ok: true, evidence: [] };
  if (!Array.isArray(value) || value.length > 20) {
    return {
      ok: false,
      message: "Typed loop evidence must be an array of at most 20 entries.",
    };
  }
  const evidence: LoopEvidence[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return invalid();
    }
    const record = item as Record<string, unknown>;
    const label = typeof record.label === "string" ? record.label.trim() : "";
    if (
      !isKind(record.kind) ||
      !label ||
      label.length > 200 ||
      typeof record.observed_at !== "string" ||
      !isIsoDate(record.observed_at) ||
      !isResult(record.result) ||
      !isVerification(record.verification) ||
      (record.head_hash !== undefined && !isHeadHash(record.head_hash))
    ) {
      return invalid();
    }
    if (
      detectSensitiveValues(label).length > 0 ||
      detectSensitiveValues(record.observed_at).length > 0
    ) {
      return {
        ok: false,
        message:
          "Typed loop evidence must not include secrets or raw local paths.",
      };
    }
    evidence.push({
      kind: record.kind,
      label,
      observed_at: record.observed_at,
      result: record.result,
      verification: record.verification,
      ...(record.head_hash ? { head_hash: record.head_hash } : {}),
    });
  }
  return { ok: true, evidence };
}

function invalid(): LoopEvidenceParseResult {
  return {
    ok: false,
    message:
      "Typed loop evidence requires kind, label, ISO observed_at, result, verification, and an optional hexadecimal head_hash.",
  };
}

function isKind(value: unknown): value is LoopEvidence["kind"] {
  return ["test", "commit", "build", "review", "external"].includes(
    value as string,
  );
}

function isResult(value: unknown): value is LoopEvidence["result"] {
  return ["passed", "failed", "unknown"].includes(value as string);
}

function isVerification(value: unknown): value is LoopEvidence["verification"] {
  return ["declared", "locally_verified"].includes(value as string);
}

function isIsoDate(value: string): boolean {
  return (
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value
  );
}

function isHeadHash(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{7,64}$/i.test(value);
}
