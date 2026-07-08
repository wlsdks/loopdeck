import type { PromptImprovement } from "../../analysis/improve.js";
import { analyzePrompt } from "../../analysis/analyze.js";
import type { PromptImprovementDraft } from "./api.js";

export function improvementFromSavedDraft(
  draft: PromptImprovementDraft,
): PromptImprovement {
  const draftScore = analyzePrompt({
    prompt: draft.draft_text,
    createdAt: draft.created_at,
  }).quality_score.value;

  return {
    mode: "saved-draft",
    requires_user_approval: true,
    summary: "Saved draft reopened for reuse.",
    improved_prompt: draft.draft_text,
    expected_impact: {
      original_score: draftScore,
      improved_score: draftScore,
      delta: 0,
      changed_axis_count: draft.changed_sections.length,
    },
    changed_sections: draft.changed_sections,
    clarifying_questions: [],
    safety_notes: draft.safety_notes,
    created_at: draft.created_at,
    analyzer: currentDraftAnalyzer(draft.analyzer),
  };
}

function currentDraftAnalyzer(analyzer: string): PromptImprovement["analyzer"] {
  return analyzer === "clarifications-v1" ? analyzer : "local-rules-v1";
}
