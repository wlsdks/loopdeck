import { Copy } from "lucide-react";
import { useState } from "react";

import type {
  LoopInstructionPatchProposal,
  LoopListResponse,
  LoopWorktreeResponse,
} from "./api.js";
import { getLoopInstructionPatch } from "./api.js";
import { LoopActivitySummary } from "./loop-activity-summary.js";
import { LoopRows, LoopWorktreeDetailRows } from "./loop-rows.js";
import { LoopWorktreeBoundaryReviewItems } from "./loop-worktree-boundary-review-items.js";
import { LoopWorktreeCollectionFreshnessItems } from "./loop-worktree-collection-freshness-items.js";
import { LoopWorktreeContinuationSafetyItems } from "./loop-worktree-continuation-safety-items.js";
import { LoopWorktreeDetailHeader } from "./loop-worktree-detail-header.js";
import { LoopWorktreeMemoryCollectionItems } from "./loop-worktree-memory-collection-items.js";
import { LoopWorktreeMemoryApprovalRetryRenewedItems } from "./loop-worktree-memory-approval-retry-renewed-items.js";
import { LoopWorktreeMergeReviewSummary } from "./loop-worktree-merge-review-summary.js";
import { LoopWorktreeRenewedMemoryApprovalItems } from "./loop-worktree-renewed-memory-approval-items.js";
import { LoopWorktreeSelectedBriefGuidance } from "./loop-worktree-selected-brief-guidance.js";

import "./loops-view.css";

export function LoopsView({
  loading,
  loops,
  onApproveMemoryCandidate,
  onCopyCommandCenterBrief,
  onCopySelectedBrief,
  onSelectWorktree,
  worktreeDetail,
}: {
  loading: boolean;
  loops?: LoopListResponse;
  onApproveMemoryCandidate?: () => Promise<void>;
  onCopyCommandCenterBrief?: (
    selection: CommandCenterBriefSelection,
  ) => Promise<void>;
  onCopySelectedBrief?: (detail: LoopWorktreeResponse) => Promise<void>;
  onSelectWorktree?: (worktree: string) => Promise<void>;
  worktreeDetail?: LoopWorktreeResponse;
}) {
  const items = loops?.items ?? [];
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [approvalRecorded, setApprovalRecorded] = useState(false);
  const [patchBusy, setPatchBusy] = useState(false);
  const [patchProposal, setPatchProposal] = useState<
    LoopInstructionPatchProposal | undefined
  >();
  const [commandCenterBriefBusy, setCommandCenterBriefBusy] = useState<
    string | undefined
  >();
  const [commandCenterBriefCopied, setCommandCenterBriefCopied] = useState<
    string | undefined
  >();
  const [selectedBriefBusy, setSelectedBriefBusy] = useState(false);
  const [selectedBriefCopied, setSelectedBriefCopied] = useState(false);

  async function approveCandidate(): Promise<void> {
    if (!onApproveMemoryCandidate) return;

    setApprovalBusy(true);
    try {
      await onApproveMemoryCandidate();
      setApprovalRecorded(true);
      window.setTimeout(() => setApprovalRecorded(false), 2_500);
    } finally {
      setApprovalBusy(false);
    }
  }

  async function reviewInstructionPatch(): Promise<void> {
    setPatchBusy(true);
    try {
      setPatchProposal(
        await getLoopInstructionPatch({ targetFile: "AGENTS.md" }),
      );
    } finally {
      setPatchBusy(false);
    }
  }

  async function copySelectedBrief(): Promise<void> {
    if (!worktreeDetail || !onCopySelectedBrief) return;

    setSelectedBriefBusy(true);
    try {
      await onCopySelectedBrief(worktreeDetail);
      setSelectedBriefCopied(true);
      window.setTimeout(() => setSelectedBriefCopied(false), 2_500);
    } finally {
      setSelectedBriefBusy(false);
    }
  }

  async function copyCommandCenterBrief(
    selection: CommandCenterBriefSelection,
  ): Promise<void> {
    if (!onCopyCommandCenterBrief) return;

    setCommandCenterBriefBusy(selection.worktree);
    try {
      await onCopyCommandCenterBrief(selection);
      setCommandCenterBriefCopied(selection.worktree);
      window.setTimeout(() => setCommandCenterBriefCopied(undefined), 2_500);
    } finally {
      setCommandCenterBriefBusy(undefined);
    }
  }

  if (loading) {
    return <section className="panel">Loading loop snapshots...</section>;
  }

  if (!loops || items.length === 0) {
    return (
      <section className="panel loops-empty">
        <div>
          <span className="panel-eyebrow">Loopdeck</span>
          <h2>No loop snapshots yet</h2>
          <p>
            Run <code>prompt-coach loop collect</code> after a Codex or Claude
            Code turn to create the first local loop snapshot.
          </p>
        </div>
        <div className="privacy-note">
          Local-only. No prompt bodies, raw paths, or compact summaries are
          shown here.
        </div>
      </section>
    );
  }

  return (
    <section className="loops-view" aria-label="Loop snapshots">
      <div className="panel loops-summary">
        <div>
          <span className="panel-eyebrow">Loopdeck</span>
          <h2>{items.length} loop snapshots</h2>
          <p className="loops-status-line">
            Loopdeck status {loops.status.status}
          </p>
          <LoopActivitySummary
            approvalBusy={approvalBusy}
            approvalRecorded={approvalRecorded}
            commandCenterBriefBusy={commandCenterBriefBusy}
            commandCenterBriefCopied={commandCenterBriefCopied}
            onApproveMemoryCandidate={approveCandidate}
            onCopyCommandCenterBrief={copyCommandCenterBrief}
            onReviewInstructionPatch={reviewInstructionPatch}
            onSelectWorktree={onSelectWorktree}
            patchBusy={patchBusy}
            status={loops.status}
          />
          <p>
            Recent local agent loops grouped by safe project metadata. Compact
            markers show when a fresh snapshot should be collected.
          </p>
        </div>
        <div className="privacy-note">
          No prompt bodies, raw paths, transcript content, or compact summaries.
        </div>
      </div>
      {patchProposal && (
        <div className="panel loop-patch-panel">
          <div>
            <span className="panel-eyebrow">Review only</span>
            <h2>{patchProposal.title}</h2>
            <p>
              Requires explicit user approval. This preview does not write
              AGENTS.md, CLAUDE.md, project docs, or memory files.
            </p>
          </div>
          <div className="loop-apply-gate">
            <span>Web apply unavailable</span>
            <code>{patchProposal.apply_gate.confirm_command}</code>
            <p>{patchProposal.apply_gate.reason}</p>
          </div>
          <pre>{patchProposal.diff}</pre>
        </div>
      )}
      {worktreeDetail && (
        <div className="loop-table panel">
          <div className="loop-worktree-detail">
            <LoopWorktreeDetailHeader worktreeDetail={worktreeDetail} />
            <LoopWorktreeSelectedBriefGuidance worktreeDetail={worktreeDetail}>
              <LoopWorktreeContinuationSafetyItems
                worktreeDetail={worktreeDetail}
              />
              <LoopWorktreeCollectionFreshnessItems
                worktreeDetail={worktreeDetail}
              />
              <LoopWorktreeMemoryCollectionItems
                worktreeDetail={worktreeDetail}
              />
              <LoopWorktreeMemoryApprovalRetryRenewedItems
                worktreeDetail={worktreeDetail}
              />
              <LoopWorktreeRenewedMemoryApprovalItems
                worktreeDetail={worktreeDetail}
              />
              <LoopWorktreeBoundaryReviewItems
                worktreeDetail={worktreeDetail}
              />
            </LoopWorktreeSelectedBriefGuidance>
            <LoopWorktreeMergeReviewSummary worktreeDetail={worktreeDetail} />
            <div className="loop-memory-action">
              <code>Continue {worktreeDetail.worktree}</code>
              <button
                className="loop-copy-button"
                disabled={!onCopySelectedBrief || selectedBriefBusy}
                onClick={() => void copySelectedBrief()}
                title="Copy selected worktree continuation brief"
                type="button"
              >
                <Copy aria-hidden size={15} />
                {selectedBriefCopied
                  ? "Copied selected brief"
                  : "Copy selected brief"}
              </button>
            </div>
          </div>
          <LoopWorktreeDetailRows worktreeDetail={worktreeDetail} />
        </div>
      )}
      <LoopRows items={items} />
    </section>
  );
}

export type CommandCenterBriefSelection = {
  worktree: string;
  branch?: string;
};
