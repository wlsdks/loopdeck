import { Save, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";

import type { LoopOutcomeStatus } from "./api.js";

export type LoopOutcomeInput = {
  status: LoopOutcomeStatus;
  summary: string;
  evidenceRefs: string[];
  usedImprovementPromptIds: string[];
};

export function LoopOutcomeForm({
  currentStatus,
  initialUsedImprovementPromptIds = [],
  initialApprovalAvailable = false,
  memoryApproved = false,
  onApprove,
  onRecord,
  promptIds,
  snapshotId,
}: {
  currentStatus: string;
  initialUsedImprovementPromptIds?: string[];
  initialApprovalAvailable?: boolean;
  memoryApproved?: boolean;
  onApprove?: (snapshotId: string) => Promise<void>;
  onRecord: (snapshotId: string, input: LoopOutcomeInput) => Promise<void>;
  promptIds: string[];
  snapshotId: string;
}) {
  const [status, setStatus] = useState<LoopOutcomeStatus>(
    isLoopOutcomeStatus(currentStatus) ? currentStatus : "unknown",
  );
  const [summary, setSummary] = useState("");
  const [evidence, setEvidence] = useState("");
  const [usedImprovementPromptIds, setUsedImprovementPromptIds] = useState<
    string[]
  >(initialUsedImprovementPromptIds);
  const [busy, setBusy] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [approvalAvailable, setApprovalAvailable] = useState(
    initialApprovalAvailable,
  );
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [approved, setApproved] = useState(memoryApproved);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setRecorded(false);
    try {
      await onRecord(snapshotId, {
        status,
        summary,
        evidenceRefs: evidence
          .split(",")
          .map((reference) => reference.trim())
          .filter(Boolean),
        usedImprovementPromptIds,
      });
      setRecorded(true);
      setApprovalAvailable(status === "passed");
    } catch {
      setRecorded(false);
    } finally {
      setBusy(false);
    }
  }

  async function approve(): Promise<void> {
    if (!onApprove) return;
    setApprovalBusy(true);
    setApproved(false);
    try {
      await onApprove(snapshotId);
      setApproved(true);
      setApprovalAvailable(false);
    } catch {
      setApproved(false);
    } finally {
      setApprovalBusy(false);
    }
  }

  return (
    <form
      className="loop-outcome-form"
      onSubmit={(event) => void submit(event)}
    >
      <div className="loop-outcome-heading">
        <div>
          <span className="panel-eyebrow">Selected snapshot</span>
          <h3>Record outcome</h3>
        </div>
        <div className="loop-outcome-statuses">
          {recorded && <span className="status-pill good">Recorded</span>}
          {approved && (
            <span className="status-pill good">Memory approved</span>
          )}
        </div>
      </div>
      <div className="loop-outcome-fields">
        <label>
          <span>Status</span>
          <select
            name="outcome-status"
            onChange={(event) =>
              setStatus(event.target.value as LoopOutcomeStatus)
            }
            value={status}
          >
            <option value="unknown">Unknown</option>
            <option value="in_progress">In progress</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="blocked">Blocked</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </label>
        <label className="loop-outcome-summary-field">
          <span>Summary</span>
          <input
            maxLength={1_000}
            name="outcome-summary"
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Focused checks passed"
            required
            value={summary}
          />
        </label>
        <label className="loop-outcome-evidence-field">
          <span>Evidence</span>
          <input
            name="outcome-evidence"
            onChange={(event) => setEvidence(event.target.value)}
            placeholder="Safe labels separated by commas"
            value={evidence}
          />
        </label>
      </div>
      {promptIds.length > 0 && (
        <fieldset className="loop-improvement-attribution">
          <legend>LoopRelay improvements used</legend>
          <div>
            {promptIds.map((promptId) => (
              <label key={promptId}>
                <input
                  checked={usedImprovementPromptIds.includes(promptId)}
                  name={`used-improvement-${promptId}`}
                  onChange={(event) =>
                    setUsedImprovementPromptIds((current) =>
                      event.target.checked
                        ? [...current, promptId]
                        : current.filter((value) => value !== promptId),
                    )
                  }
                  type="checkbox"
                />
                <code>{promptId}</code>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="loop-outcome-actions">
        <button className="loop-copy-button" disabled={busy} type="submit">
          <Save aria-hidden="true" size={15} />
          {busy ? "Saving" : "Save outcome"}
        </button>
        {approvalAvailable && onApprove && (
          <button
            className="loop-copy-button"
            disabled={approvalBusy}
            onClick={() => void approve()}
            type="button"
          >
            <ShieldCheck aria-hidden="true" size={15} />
            {approvalBusy ? "Approving" : "Approve selected memory"}
          </button>
        )}
        <span>Local only · No automatic memory approval</span>
      </div>
    </form>
  );
}

function isLoopOutcomeStatus(value: string): value is LoopOutcomeStatus {
  return [
    "unknown",
    "in_progress",
    "passed",
    "failed",
    "blocked",
    "abandoned",
  ].includes(value);
}
