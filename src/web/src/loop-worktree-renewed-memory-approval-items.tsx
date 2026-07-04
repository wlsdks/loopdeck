import type { LoopWorktreeResponse } from "./api.js";
import { renderReviewItem } from "./loop-worktree-review-items.js";

export function LoopWorktreeRenewedMemoryApprovalItems({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <>
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection reminder writes or external calls",
        ["label", "reminder", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection result persistence writes or external calls",
        ["label", "result_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection uncertainty writes or external calls",
        ["label", "reminder", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit freshness advisory writes or external calls",
        ["label", "advisory", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-merge freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-handoff freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-paste freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-submit freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-merge freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-handoff freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-paste freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-submit freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection post-submit freshness advisory writes or external calls",
        ["label", "advisory", "not_monitored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness result persistence writes or external calls",
        ["label", "not_stored", "not_detected", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness uncertainty collection writes or external calls",
        ["label", "reminder", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection result persistence writes or external calls",
        ["label", "result_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder,
        "No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection uncertainty writes or external calls",
        ["label", "reminder", "not_automated", "reason"],
      )}
    </>
  );
}
