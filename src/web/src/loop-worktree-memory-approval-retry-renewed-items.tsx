import type { LoopWorktreeResponse } from "./api.js";
import { renderReviewItem } from "./loop-worktree-review-items.js";

export function LoopWorktreeMemoryApprovalRetryRenewedItems({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <>
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder,
        "No post-memory-approval retry renewed-memory-approval collection writes or external calls",
        ["label", "reminder", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note,
        "No post-memory-approval retry renewed-memory-approval collection result persistence writes or external calls",
        ["label", "result_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder,
        "No post-memory-approval retry renewed-memory-approval collection uncertainty writes or external calls",
        ["label", "reminder", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval pre-merge freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval pre-handoff freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval pre-paste freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval pre-submit freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit freshness advisory writes or external calls",
        ["label", "advisory", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note,
        "No post-memory-approval retry renewed-memory-approval post-submit collection result persistence writes or external calls",
        ["label", "result_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note,
        "No post-memory-approval retry renewed-memory-approval post-submit collection retry writes or external calls",
        ["label", "retry", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note,
        "No post-memory-approval retry renewed-memory-approval post-submit retry outcome persistence writes or external calls",
        ["label", "outcome_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note,
        "No post-memory-approval retry renewed-memory-approval post-submit retry evidence freshness verification writes or external calls",
        ["label", "freshness_scope", "not_verified", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note,
        "No post-memory-approval retry renewed-memory-approval post-submit retry freshness result persistence writes or external calls",
        ["label", "result_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder,
        "No post-memory-approval retry renewed-memory-approval post-submit retry freshness uncertainty collection writes or external calls",
        ["label", "collection_trigger", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory,
        "No post-memory-approval retry renewed-memory-approval post-submit retry pre-memory-approval freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
    </>
  );
}
