import type { LoopWorktreeResponse } from "./api.js";
import { renderReviewItem } from "./loop-worktree-review-items.js";

export function LoopWorktreeCollectionFreshnessItems({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <>
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_submission_collection_reminder_note,
        "No post-submission collection writes or external calls",
        ["label", "reminder", "not_background", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_collection_result_non_persistence_note,
        "No collection result persistence writes or external calls",
        ["label", "result_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_collection_retry_boundary_note,
        "No collection retry writes or external calls",
        ["label", "retry", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_retry_outcome_non_persistence_note,
        "No retry outcome persistence writes or external calls",
        ["label", "outcome_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_collection_evidence_freshness_boundary_note,
        "No freshness verification writes or external calls",
        ["label", "freshness_check", "not_verified", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_freshness_result_non_persistence_note,
        "No freshness result persistence writes or external calls",
        ["label", "result_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_freshness_uncertainty_collection_reminder,
        "No freshness uncertainty collection writes or external calls",
        ["label", "reminder", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_pre_merge_freshness_advisory,
        "No pre-merge freshness writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_pre_memory_approval_freshness_advisory,
        "No pre-memory-approval freshness writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
    </>
  );
}
