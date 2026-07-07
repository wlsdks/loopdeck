import { useState } from "react";

import type {
  PromptFilters,
  PromptListResponse,
  PromptSummary,
} from "./api.js";

export type PromptListQueryOptions = {
  cursor?: string;
  replace?: boolean;
};

export function mergePromptListPage({
  current,
  cursor,
  items,
  replace,
}: {
  current: PromptSummary[];
  cursor?: string;
  items: PromptSummary[];
  replace?: boolean;
}): PromptSummary[] {
  return cursor && !replace ? [...current, ...items] : items;
}

export function getPromptListCursor(
  filters: PromptFilters,
  nextCursor: string | undefined,
): string | undefined {
  return filters.query?.trim() ? undefined : nextCursor;
}

export function updatePromptListItem(
  prompts: PromptSummary[],
  id: string,
  patch: Partial<PromptSummary>,
): PromptSummary[] {
  return prompts.map((prompt) =>
    prompt.id === id ? { ...prompt, ...patch } : prompt,
  );
}

export function usePromptListQuery({
  listPrompts,
  onError,
}: {
  listPrompts(
    filters: PromptFilters,
    cursor?: string,
  ): Promise<PromptListResponse>;
  onError(message: string | undefined): void;
}): {
  loading: boolean;
  nextCursor: string | undefined;
  prompts: PromptSummary[];
  refreshList(
    filters: PromptFilters,
    options?: PromptListQueryOptions,
  ): Promise<void>;
  updatePrompt(id: string, patch: Partial<PromptSummary>): void;
} {
  const [prompts, setPrompts] = useState<PromptSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  async function refreshList(
    filters: PromptFilters,
    options: PromptListQueryOptions = {},
  ): Promise<void> {
    setLoading(true);
    onError(undefined);
    try {
      const result = await listPrompts(filters, options.cursor);
      setPrompts((current) =>
        mergePromptListPage({
          current,
          cursor: options.cursor,
          items: result.items,
          replace: options.replace,
        }),
      );
      setNextCursor(result.next_cursor);
    } catch {
      onError("Could not load prompts.");
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    nextCursor,
    prompts,
    refreshList,
    updatePrompt(id, patch): void {
      setPrompts((current) => updatePromptListItem(current, id, patch));
    },
  };
}
