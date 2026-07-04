import Database from "better-sqlite3";

import type { PromptImprovementDraft } from "./ports.js";
import { readQualityCriteria, readStringArray } from "./sqlite-json.js";
import type { PromptImprovementDraftRow } from "./sqlite-rows.js";

export function markPromptImprovementDraftCopied(
  db: Database.Database,
  promptId: string,
  draftId: string,
  now: Date,
): { updated: boolean; draft?: PromptImprovementDraft } {
  const copiedAt = now.toISOString();
  const result = db
    .prepare(
      `
      UPDATE prompt_improvement_drafts
      SET copied_at = ?
      WHERE id = ? AND prompt_id = ?
      `,
    )
    .run(copiedAt, draftId, promptId);

  if (result.changes === 0) {
    return { updated: false };
  }

  const draft = readPromptImprovementDrafts(db, promptId).find(
    (item) => item.id === draftId,
  );
  return draft ? { updated: true, draft } : { updated: false };
}

export function readPromptImprovementDrafts(
  db: Database.Database,
  promptId: string,
): PromptImprovementDraft[] {
  const rows = db
    .prepare(
      `
      SELECT *
      FROM prompt_improvement_drafts
      WHERE prompt_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 20
      `,
    )
    .all(promptId) as PromptImprovementDraftRow[];

  return rows.map((row) => ({
    id: row.id,
    prompt_id: row.prompt_id,
    draft_text: row.draft_text,
    analyzer: row.analyzer,
    changed_sections: readQualityCriteria(row.changed_sections_json),
    safety_notes: readStringArray(row.safety_notes_json),
    is_sensitive: row.is_sensitive === 1,
    redaction_policy: "mask",
    created_at: row.created_at,
    copied_at: row.copied_at ?? undefined,
    accepted_at: row.accepted_at ?? undefined,
  }));
}
