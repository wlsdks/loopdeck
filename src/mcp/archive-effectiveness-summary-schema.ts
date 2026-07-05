export const ARCHIVE_EFFECTIVENESS_SUMMARY_SCHEMA = {
  type: "object",
  required: [
    "measured_prompts",
    "unmeasured_prompts",
    "verdicts",
    "calibration",
    "top_evidence_refs",
    "next_action",
  ],
  properties: {
    measured_prompts: { type: "integer", minimum: 0 },
    unmeasured_prompts: { type: "integer", minimum: 0 },
    verdicts: {
      type: "object",
      required: ["proven", "mixed", "unproven"],
      properties: {
        proven: { type: "integer", minimum: 0 },
        mixed: { type: "integer", minimum: 0 },
        unproven: { type: "integer", minimum: 0 },
      },
    },
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
    top_evidence_refs: { type: "array", items: { type: "string" } },
    next_action: { type: "string" },
  },
} as const;
