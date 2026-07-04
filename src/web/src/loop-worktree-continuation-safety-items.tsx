import type { LoopWorktreeResponse } from "./api.js";
import { renderReviewItem } from "./loop-worktree-review-items.js";

export function LoopWorktreeContinuationSafetyItems({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <>
      {renderReviewItem(
        worktreeDetail.continuation_safety_group,
        "No safety guidance writes or external calls",
        ["label", "scope", "includes", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_ordering_note,
        "No ordering writes or external calls",
        ["label", "first", "then", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_non_persistence_note,
        "No safety review state storage or external calls",
        ["label", "state", "reminder", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_recheck_cue,
        "No re-check writes or external calls",
        ["label", "trigger", "instruction", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_copy_feedback_reminder,
        "No copy feedback reminder writes or external calls",
        ["label", "feedback_scope", "next_step", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_copy_feedback_accessibility_note,
        "No accessibility feedback writes or external calls",
        ["label", "visible_label", "assistive_feedback", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_copy_feedback_timeout_note,
        "No copy feedback timeout writes or external calls",
        ["label", "timeout_scope", "not_state", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_copy_feedback_failure_note,
        "No copy feedback failure writes or external calls",
        ["label", "failure_scope", "not_state", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_copy_retry_note,
        "No copy retry writes or external calls",
        ["label", "retry_scope", "not_automatic", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_pre_paste_confirmation_note,
        "No pre-paste confirmation writes or external calls",
        ["label", "confirmation", "not_submission", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_target_agent_check_note,
        "No target-agent check writes or external calls",
        ["label", "check", "not_inspection", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_paste_destination_boundary_note,
        "No paste destination boundary writes or external calls",
        ["label", "boundary", "not_verified", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_manual_submission_boundary_note,
        "No manual submission boundary writes or external calls",
        ["label", "submission", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_submission_result_non_persistence_note,
        "No submission result persistence writes or external calls",
        ["label", "result_scope", "not_stored", "reason"],
      )}
    </>
  );
}
