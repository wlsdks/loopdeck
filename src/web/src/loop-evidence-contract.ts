export type LoopEvidence = {
  kind: "test" | "commit" | "build" | "review" | "external";
  label: string;
  observed_at: string;
  result: "passed" | "failed" | "unknown";
  verification: "declared" | "locally_verified";
  head_hash?: string;
};

export function isLoopEvidence(value: unknown): value is LoopEvidence {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const evidence = value as Partial<LoopEvidence>;
  return (
    ["test", "commit", "build", "review", "external"].includes(
      evidence.kind ?? "",
    ) &&
    typeof evidence.label === "string" &&
    typeof evidence.observed_at === "string" &&
    ["passed", "failed", "unknown"].includes(evidence.result ?? "") &&
    ["declared", "locally_verified"].includes(evidence.verification ?? "") &&
    (evidence.head_hash === undefined || typeof evidence.head_hash === "string")
  );
}
