import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

async function scoreModule() {
  return import(
    pathToFileURL(join(process.cwd(), "scripts/benchmark-scores.mjs")).href
  );
}

describe("benchmark scoring profiles", () => {
  const listItems = [
    {
      id: "one",
      quality_score: 62,
      quality_score_band: "fair",
      snippet: "First",
    },
    {
      id: "two",
      quality_score: 68,
      quality_score_band: "fair",
      snippet: "Second",
    },
  ];
  const detailItems = [
    { id: "one", analysis: { quality_score: { value: 62, band: "fair" } } },
    { id: "two", analysis: { quality_score: { value: 68, band: "fair" } } },
  ];

  it("scores real corpus delivery integrity without synthetic fixture assumptions", async () => {
    const { scorePromptQualityEvidence } = await scoreModule();

    expect(
      scorePromptQualityEvidence({
        fixtureSet: "real",
        listItems,
        detailItems,
        fixtureCount: 2,
      }),
    ).toEqual({
      score: 1,
      profile: "real_corpus_delivery_integrity",
      checks: {
        all_prompts_scored: true,
        scores_in_range: true,
        list_detail_consistent: true,
      },
    });
  });

  it("keeps vague-prompt and score-spread calibration in the synthetic profile", async () => {
    const { scorePromptQualityEvidence } = await scoreModule();

    expect(
      scorePromptQualityEvidence({
        fixtureSet: "synthetic",
        listItems,
        detailItems,
        fixtureCount: 2,
      }),
    ).toEqual({
      score: 0.6,
      profile: "synthetic_score_calibration",
      checks: {
        all_prompts_scored: true,
        scores_in_range: true,
        list_detail_consistent: true,
        vague_prompt_scores_low: false,
        score_spread_is_calibrated: false,
      },
    });
  });

  it("measures actual passed outcomes independently from evidence shape", async () => {
    const { scoreOutcomePassRate } = await scoreModule();

    expect(
      scoreOutcomePassRate({
        calibration: { linked_outcomes: 3, passing_outcomes: 2 },
      }),
    ).toBe(0.667);
    expect(
      scoreOutcomePassRate({
        calibration: { linked_outcomes: 0, passing_outcomes: 0 },
      }),
    ).toBe(0);
  });

  it("accepts operator evidence refs for real effectiveness shape checks", async () => {
    const { scoreArchiveEffectivenessEvidence } = await scoreModule();
    const report = {
      effectiveness_summary: {
        measured_prompts: 1,
        unmeasured_prompts: 1,
        verdicts: { proven: 1 },
        calibration: {
          linked_outcomes: 1,
          passing_outcomes: 1,
          total_tests_run: 4,
        },
        top_evidence_refs: ["test:focused-check"],
        next_action:
          "Link more real prompts to completed outcomes for coverage.",
      },
    };

    expect(
      scoreArchiveEffectivenessEvidence({
        fixtureSet: "real",
        report,
        fixtureCount: 2,
        forbiddenValues: [],
      }),
    ).toBe(1);
    expect(
      scoreArchiveEffectivenessEvidence({
        fixtureSet: "synthetic",
        report,
        fixtureCount: 2,
        forbiddenValues: [],
      }),
    ).toBe(0.889);
  });
});
