import type { LoopSnapshot } from "./types.js";

export type LoopSnapshotSelection = {
  worktree?: string;
  sessionId?: string;
  branch?: string;
};

export function hasLoopSnapshotSelection(
  selection: LoopSnapshotSelection,
): boolean {
  return Boolean(selection.worktree || selection.sessionId || selection.branch);
}

export function selectLoopSnapshot(
  snapshots: readonly LoopSnapshot[],
  selection: LoopSnapshotSelection,
): LoopSnapshot | undefined {
  return snapshots.find((snapshot) => {
    if (selection.worktree && snapshot.worktree_label !== selection.worktree) {
      return false;
    }
    if (selection.sessionId && snapshot.session_id !== selection.sessionId) {
      return false;
    }
    if (selection.branch && snapshot.branch !== selection.branch) {
      return false;
    }
    return true;
  });
}
