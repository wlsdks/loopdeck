import { Copy } from "lucide-react";

import type { LoopListResponse } from "./api.js";
import type { CommandCenterBriefSelection } from "./loops-view.js";

type CommandCenter = NonNullable<
  LoopListResponse["status"]["activity"]["command_center"]
>;
type LoopActivity = LoopListResponse["status"]["activity"];

export function LoopCommandCenterSummary({
  activity,
  busyWorktree,
  copiedWorktree,
  onCopyCommandCenterBrief,
}: {
  activity: LoopActivity;
  busyWorktree?: string;
  copiedWorktree?: string;
  onCopyCommandCenterBrief?: (
    selection: CommandCenterBriefSelection,
  ) => Promise<void>;
}) {
  const commandCenter: CommandCenter | undefined = activity.command_center;

  if (!commandCenter) return null;

  return (
    <div className="loop-memory-action">
      <span>Command center</span>
      <code>{commandCenter.title}</code>
      <p className="loops-status-line">{commandCenter.primary_action}</p>
      <p className="loops-status-line">
        Review packet {commandCenter.review_packet.status}
      </p>
      <p className="loops-status-line">
        {commandCenter.review_packet.summary}
      </p>
      <p className="loops-status-line">
        Next {commandCenter.review_packet.next_action}
      </p>
      {commandCenter.review_packet.decision_advisory && (
        <p className="loops-status-line">
          Decision advisory{" "}
          {commandCenter.review_packet.decision_advisory.next_action}
        </p>
      )}
      <div>
        <p className="loops-status-line">Human checklist</p>
        {commandCenter.review_packet.checklist.map((item) => (
          <p className="loops-status-line" key={item.action}>
            {item.label} {item.status}
          </p>
        ))}
      </div>
      {commandCenter.review_items.slice(0, 3).map((item) => (
        <div className="loop-worktree-line" key={item.worktree}>
          <div>
            <p className="loops-status-line">
              {item.worktree}: {item.recommendation}
            </p>
            <p className="loops-status-line">
              Merge readiness {item.merge_readiness.status}
            </p>
            <p className="loops-status-line">
              Evidence {item.merge_readiness.evidence} / Evidence refs{" "}
              {item.evidence_count}
            </p>
            <code>{item.continuation_command}</code>
          </div>
          <button
            className="loop-copy-button"
            disabled={!onCopyCommandCenterBrief || busyWorktree === item.worktree}
            onClick={() =>
              void onCopyCommandCenterBrief?.({
                worktree: item.worktree,
                ...(item.branch ? { branch: item.branch } : {}),
              })
            }
            title={`Copy review brief for ${item.worktree}`}
            type="button"
          >
            <Copy aria-hidden size={15} />
            {copiedWorktree === item.worktree
              ? "Copied review brief"
              : "Copy review brief"}
          </button>
        </div>
      ))}
    </div>
  );
}
