import type Database from "better-sqlite3";

export function hasLivePrompt(db: Database.Database, id: string): boolean {
  return Boolean(
    db
      .prepare("SELECT 1 FROM prompts WHERE id = ? AND deleted_at IS NULL")
      .get(id),
  );
}
