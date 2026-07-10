import type { LoopWorktreeResponse } from "./api.js";
import { LoopOutcomeForm, type LoopOutcomeInput } from "./loop-outcome-form.js";

export function LoopWorktreeOutcomePanel({
  detail,
  onApprove,
  onRecord,
}: {
  detail: LoopWorktreeResponse;
  onApprove?: (snapshotId: string) => Promise<void>;
  onRecord?: (snapshotId: string, input: LoopOutcomeInput) => Promise<void>;
}) {
  const snapshot = detail.items[0];
  if (!snapshot || !onRecord) return null;

  return (
    <LoopOutcomeForm
      currentStatus={snapshot.outcome_status}
      initialUsedImprovementPromptIds={
        snapshot.used_improvement_prompt_ids ?? []
      }
      initialApprovalAvailable={detail.memory_candidate?.eligible === true}
      key={snapshot.id}
      memoryApproved={detail.memory_approved === true}
      onApprove={onApprove}
      onRecord={onRecord}
      promptIds={Array.from(new Set(snapshot.prompt_ids ?? []))}
      snapshotId={snapshot.id}
    />
  );
}
