import type { LoopSnapshot } from "./types.js";

export type LoopBrief = {
  title: string;
  prompt: string;
  source_snapshot_id: string;
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
  };
};

export function createLoopBrief(input: { snapshot: LoopSnapshot }): LoopBrief {
  const snapshot = input.snapshot;
  const gaps =
    snapshot.quality.top_gaps.length > 0
      ? snapshot.quality.top_gaps.map((gap) => `- ${gap}`).join("\n")
      : "- No recurring prompt gaps recorded in this snapshot.";
  const average =
    snapshot.quality.average_prompt_score === undefined
      ? "not enough prompt data"
      : `${snapshot.quality.average_prompt_score}/100`;
  const promptIds =
    snapshot.prompt_ids.length > 0
      ? snapshot.prompt_ids.join(", ")
      : "none captured yet";

  return {
    title: `Continue agent loop ${snapshot.id}`,
    source_snapshot_id: snapshot.id,
    prompt: [
      "## Goal",
      "Continue the current coding-agent loop using the local Loopdeck snapshot.",
      "",
      "## Context",
      `project: ${snapshot.cwd_label}`,
      `tool: ${snapshot.tool}`,
      `source: ${snapshot.source}`,
      snapshot.session_id ? `session: ${snapshot.session_id}` : undefined,
      snapshot.branch ? `branch: ${snapshot.branch}` : undefined,
      snapshot.worktree_label
        ? `worktree: ${snapshot.worktree_label}`
        : undefined,
      `prompt ids: ${promptIds}`,
      `average prompt score: ${average}`,
      "",
      "## Current Loop State",
      snapshot.outcome.summary,
      "",
      "## Prompt Habits To Improve",
      gaps,
      "",
      "## Scope",
      "Keep the next change tied to this loop. Do not rename packages, change agent settings, or edit instruction files unless that is the explicit task.",
      "",
      "## Verification",
      "Run the narrowest relevant test first, then the Node 22 pnpm gate when behavior changes. Report command output and remaining risk.",
      "",
      "## Output",
      "Return a short Markdown summary with changes, verification, and risks.",
    ]
      .filter((line): line is string => line !== undefined)
      .join("\n"),
    privacy: {
      local_only: true,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
    },
  };
}
