import type { PromptSummary } from "./api.js";
import type { View } from "./routing.js";

export type VisibleChrome = {
  eyebrow: string;
  title: string;
};

export type QueueNavigationPrompt = Pick<PromptSummary, "id">;

export type QueueNavigation<TPrompt extends QueueNavigationPrompt> = {
  current: number | undefined;
  next: TPrompt | undefined;
  previous: TPrompt | undefined;
  total?: number;
};

export function getVisibleChrome(view: View): VisibleChrome {
  if (view.name === "settings") {
    return { eyebrow: "Local prompt archive", title: "Settings" };
  }
  if (view.name === "exports") {
    return { eyebrow: "Local prompt archive", title: "Anonymized export" };
  }
  if (view.name === "mcp") {
    return { eyebrow: "Agent-native coach tools", title: "MCP tools" };
  }
  if (view.name === "projects") {
    return { eyebrow: "Local prompt archive", title: "Projects" };
  }
  if (view.name === "loops") {
    return { eyebrow: "Agent loop memory", title: "Loops" };
  }
  if (view.name === "scores") {
    return { eyebrow: "Prompt habit analysis", title: "Prompt scores" };
  }
  if (view.name === "coach") {
    return {
      eyebrow: "Prompt improvement workspace",
      title: "Prompt coach",
    };
  }
  if (view.name === "detail") {
    return { eyebrow: "Local prompt archive", title: "Prompt detail" };
  }
  if (view.name === "dashboard") {
    return { eyebrow: "Local prompt archive", title: "Quality dashboard" };
  }
  return { eyebrow: "Local prompt archive", title: "Prompt archive" };
}

export function getQueueNavigation<TPrompt extends QueueNavigationPrompt>(
  view: View,
  prompts: TPrompt[],
): QueueNavigation<TPrompt> {
  if (view.name !== "detail") {
    return { current: undefined, next: undefined, previous: undefined };
  }

  const index = prompts.findIndex((prompt) => prompt.id === view.id);
  if (index === -1) {
    return { current: undefined, next: undefined, previous: undefined };
  }

  return {
    current: index + 1,
    next: prompts[index + 1],
    previous: prompts[index - 1],
    total: prompts.length,
  };
}
