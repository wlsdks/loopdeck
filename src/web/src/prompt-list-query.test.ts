import { describe, expect, it } from "vitest";

import type { PromptFilters, PromptSummary } from "./api.js";
import {
  getPromptListCursor,
  mergePromptListPage,
  updatePromptListItem,
} from "./prompt-list-query.js";

const basePrompt = {
  id: "prompt-1",
  tool: "codex",
  source_event: "UserPromptSubmit",
  session_id: "session-1",
  cwd: "/redacted",
  received_at: "2026-07-08T00:00:00.000Z",
  snippet: "Captured prompt",
  prompt_length: 16,
  excluded_from_analysis: false,
  redaction_policy: "mask",
  adapter_version: "test",
  index_status: "indexed",
  tags: [],
  quality_gaps: [],
  quality_score: 0.8,
  quality_score_band: "good",
  usefulness: {
    bookmarked: false,
    copied_count: 0,
  },
  duplicate_count: 0,
  is_sensitive: false,
  created_at: "2026-07-08T00:00:00.000Z",
} satisfies PromptSummary;

describe("prompt list query", () => {
  it("replaces the current list for initial or forced refreshes", () => {
    const nextPrompt = { ...basePrompt, id: "prompt-2" };

    expect(
      mergePromptListPage({
        current: [basePrompt],
        items: [nextPrompt],
        replace: true,
      }),
    ).toEqual([nextPrompt]);

    expect(
      mergePromptListPage({
        current: [basePrompt],
        items: [nextPrompt],
      }),
    ).toEqual([nextPrompt]);
  });

  it("appends cursor pages unless replacement is requested", () => {
    const nextPrompt = { ...basePrompt, id: "prompt-2" };

    expect(
      mergePromptListPage({
        current: [basePrompt],
        cursor: "cursor-2",
        items: [nextPrompt],
      }),
    ).toEqual([basePrompt, nextPrompt]);
  });

  it("hides the load-more cursor while a search query is active", () => {
    expect(
      getPromptListCursor({ query: " reuse " } satisfies PromptFilters, "next"),
    ).toBeUndefined();
    expect(getPromptListCursor({ isSensitive: "all" }, "next")).toBe("next");
  });

  it("updates one prompt summary without changing other rows", () => {
    const nextPrompt = { ...basePrompt, id: "prompt-2" };
    const updated = updatePromptListItem([basePrompt, nextPrompt], "prompt-2", {
      usefulness: {
        bookmarked: true,
        copied_count: 1,
      },
    });

    expect(updated[0]).toBe(basePrompt);
    expect(updated[1]).toEqual({
      ...nextPrompt,
      usefulness: {
        bookmarked: true,
        copied_count: 1,
      },
    });
  });
});
