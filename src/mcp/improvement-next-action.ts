import { decideCoachingAction } from "../analysis/coaching-decision.js";
import type { PromptImprovement } from "../analysis/improve.js";
import type { ImprovePromptToolResult } from "./score-tool-types.js";

export function shouldAskForImprovement(
  improvement: PromptImprovement,
  options: { decisionPrompt?: string; now?: Date } = {},
): boolean {
  if (improvement.clarifying_questions.length === 0) {
    return false;
  }
  if (!options.decisionPrompt) {
    return true;
  }

  const decision = decideCoachingAction(options.decisionPrompt, {
    mode: "ask",
    now: options.now,
  });
  return !(
    decision.action === "none" && decision.reason === "ask_acknowledgment"
  );
}

export function improvementNextActionRequiresAsk(
  improvement: Exclude<ImprovePromptToolResult, { is_error: true }>,
): boolean {
  return improvement.next_action.includes("Ask the user");
}
