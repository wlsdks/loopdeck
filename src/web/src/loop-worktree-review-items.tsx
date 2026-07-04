import { LoopReviewItem } from "./loop-review-item.js";

export type ReviewItemSource =
  | Readonly<Record<string, string | boolean>>
  | undefined;

export function renderReviewItem(
  item: ReviewItemSource,
  footer: string,
  lineKeys: readonly string[],
) {
  if (!item) return null;

  return (
    <LoopReviewItem
      footer={footer}
      lines={lineKeys.map((lineKey) => String(item[lineKey] ?? ""))}
    />
  );
}
