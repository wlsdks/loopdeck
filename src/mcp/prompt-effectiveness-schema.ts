export const PROMPT_EFFECTIVENESS_SCHEMA = {
  type: "object",
  required: ["verdict", "summary", "calibration", "evidence_refs"],
  properties: {
    verdict: { type: "string", enum: ["proven", "mixed", "unproven"] },
    summary: { type: "string" },
    calibration: {
      type: "object",
      required: [
        "linked_outcomes",
        "passing_outcomes",
        "failing_outcomes",
        "total_tests_run",
      ],
      properties: {
        linked_outcomes: { type: "integer", minimum: 0 },
        passing_outcomes: { type: "integer", minimum: 0 },
        failing_outcomes: { type: "integer", minimum: 0 },
        total_tests_run: { type: "integer", minimum: 0 },
      },
    },
    evidence_refs: { type: "array", items: { type: "string" } },
  },
} as const;
