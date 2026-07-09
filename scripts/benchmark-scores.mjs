export function scorePromptQualityEvidence({
  fixtureSet,
  listItems,
  detailItems,
  fixtureCount,
}) {
  const scores = detailItems
    .map((detail) => detail.analysis?.quality_score?.value)
    .filter((value) => typeof value === "number");
  const checks = {
    all_prompts_scored: scores.length === fixtureCount,
    scores_in_range: scores.every((score) => score >= 0 && score <= 100),
    list_detail_consistent: listItems.every((item) => {
      const detail = detailItems.find((candidate) => candidate.id === item.id);
      return (
        detail !== undefined &&
        item.quality_score === detail.analysis?.quality_score?.value &&
        item.quality_score_band === detail.analysis?.quality_score?.band
      );
    }),
  };

  if (fixtureSet === "real") {
    return {
      score: scoreChecks(checks),
      profile: "real_corpus_delivery_integrity",
      checks,
    };
  }

  const vagueId = listItems.find((item) =>
    item.snippet.includes("Make this better"),
  )?.id;
  const vagueScore = detailItems.find((item) => item.id === vagueId)?.analysis
    ?.quality_score?.value;
  const syntheticChecks = {
    ...checks,
    vague_prompt_scores_low: typeof vagueScore === "number" && vagueScore <= 20,
    score_spread_is_calibrated:
      scores.length > 0 && Math.max(...scores) - Math.min(...scores) >= 50,
  };
  return {
    score: scoreChecks(syntheticChecks),
    profile: "synthetic_score_calibration",
    checks: syntheticChecks,
  };
}

export function scoreArchiveEffectivenessEvidence({
  fixtureSet,
  report,
  fixtureCount,
  forbiddenValues,
}) {
  const summary = report.effectiveness_summary;
  const serialized = JSON.stringify(summary);
  const evidenceRefCheck =
    fixtureSet === "synthetic"
      ? summary.top_evidence_refs.includes("benchmark:effectiveness")
      : summary.top_evidence_refs.length > 0;
  const checks = [
    summary.measured_prompts >= 1,
    summary.unmeasured_prompts === fixtureCount - summary.measured_prompts,
    summary.verdicts.proven >= 1,
    summary.calibration.linked_outcomes >= 1,
    summary.calibration.passing_outcomes >= 1,
    summary.calibration.total_tests_run >= 1,
    evidenceRefCheck,
    typeof summary.next_action === "string" && summary.next_action.length > 20,
    forbiddenValues.every((value) => !serialized.includes(value)),
  ];
  return roundScore(checks.filter(Boolean).length / checks.length);
}

export function scoreOutcomePassRate(effectivenessSummary) {
  const linked = effectivenessSummary.calibration.linked_outcomes;
  if (!Number.isFinite(linked) || linked <= 0) return 0;
  const passed = effectivenessSummary.calibration.passing_outcomes;
  if (!Number.isFinite(passed) || passed < 0) return 0;
  return roundScore(passed / linked);
}

function scoreChecks(checks) {
  const values = Object.values(checks);
  return roundScore(values.filter(Boolean).length / values.length);
}

function roundScore(value) {
  return Math.round(value * 1000) / 1000;
}
