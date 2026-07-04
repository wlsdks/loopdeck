import type { LoopWorktreeResponse } from "./api.js";
import { renderReviewItem } from "./loop-worktree-review-items.js";

export function LoopWorktreeMemoryCollectionItems({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <>
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_collection_reminder,
        "No post-memory-approval collection writes or external calls",
        ["label", "reminder", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_collection_result_non_persistence_note,
        "No post-memory-approval collection result persistence writes or external calls",
        ["label", "result_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_collection_retry_boundary_note,
        "No post-memory-approval collection retry writes or external calls",
        ["label", "retry", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_outcome_non_persistence_note,
        "No post-memory-approval retry outcome persistence writes or external calls",
        ["label", "outcome_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note,
        "No post-memory-approval retry freshness verification writes or external calls",
        ["label", "review", "not_verified", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note,
        "No post-memory-approval retry freshness result persistence writes or external calls",
        ["label", "result_scope", "not_stored", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder,
        "No post-memory-approval retry freshness uncertainty collection writes or external calls",
        ["label", "reminder", "not_automated", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory,
        "No post-memory-approval retry pre-memory-approval freshness advisory writes or external calls",
        ["label", "advisory", "not_decision", "reason"],
      )}
    </>
  );
}
