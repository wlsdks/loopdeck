import type { LoopWorktreeResponse } from "./api.js";
import { LoopReviewItem } from "./loop-review-item.js";

export function LoopWorktreeRenewedMemoryApprovalItems({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <>
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection reminder writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
              .reminder,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
              .not_automated,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection result persistence writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
              .result_scope,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
              .not_stored,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection uncertainty writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
              .reminder,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
              .not_automated,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
              .reason,
          ]}
        />
      )}
    </>
  );
}
