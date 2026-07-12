import { useEffect, useState } from "react";

import {
  getAgentGuide,
  recordAgentGuideRun,
  type AgentGuideResponse,
  type AgentGuideRunInput,
} from "./agent-guide-api.js";

import "./agent-guide-panel.css";

type GuideRecommendation = Exclude<AgentGuideResponse, { status: "empty" }>;

const PROFILES = [
  { key: "codex:gpt-5.6-sol", tool: "codex", model: "gpt-5.6-sol" },
  { key: "codex:gpt-5.6-terra", tool: "codex", model: "gpt-5.6-terra" },
  { key: "codex:gpt-5.6-luna", tool: "codex", model: "gpt-5.6-luna" },
  { key: "claude-code:opus", tool: "claude-code", model: "opus" },
  { key: "claude-code:sonnet", tool: "claude-code", model: "sonnet" },
  { key: "claude-code:haiku", tool: "claude-code", model: "haiku" },
] as const;

type ProfileKey = (typeof PROFILES)[number]["key"];

export function AgentGuidePanel({ snapshotId }: { snapshotId: string }) {
  const [guide, setGuide] = useState<AgentGuideResponse>();

  useEffect(() => {
    void getAgentGuide("continuation", snapshotId)
      .then(setGuide)
      .catch(() => undefined);
  }, [snapshotId]);

  if (!guide) return null;
  if ("status" in guide)
    return (
      <section className="panel agent-guide-panel" aria-label="Agent guide">
        <h2>Agent guide</h2>
        <p>{guide.next_action}</p>
      </section>
    );

  return (
    <section className="panel agent-guide-panel" aria-label="Agent guide">
      <div className="agent-guide-heading">
        <div>
          <p className="eyebrow">Local decision support</p>
          <h2>Agent guide</h2>
        </div>
        <span className="agent-guide-confidence">
          {guide.confidence} confidence
        </span>
      </div>
      <p className="agent-guide-recommendation">
        <strong>
          {guide.primary.tool} {guide.primary.model}
        </strong>{" "}
        · {guide.role}
      </p>
      <p>{guide.reasons.join(" ")}</p>
      <p>Switch: {guide.switch_condition}</p>
      <p className="agent-guide-evidence">
        Evidence: {guide.evidence.passing_runs}/{guide.evidence.completed_runs}{" "}
        passing local runs. LoopRelay never switches models automatically.
      </p>
      <AgentGuideRunCapture
        guide={guide}
        onRecord={async (input) => {
          await recordAgentGuideRun(input);
          setGuide(await getAgentGuide("continuation", snapshotId));
        }}
        snapshotId={snapshotId}
      />
    </section>
  );
}

export function AgentGuideRunCapture({
  guide,
  onRecord,
  snapshotId,
}: {
  guide: GuideRecommendation;
  onRecord(input: AgentGuideRunInput): Promise<void>;
  snapshotId: string;
}) {
  const [profileKey, setProfileKey] = useState<ProfileKey>(() =>
    profileKeyFor(guide.primary),
  );
  const [outcomeStatus, setOutcomeStatus] =
    useState<AgentGuideRunInput["outcome_status"]>("unknown");
  const [acceptedRecommendation, setAcceptedRecommendation] = useState(false);
  const [attempts, setAttempts] = useState("1");
  const [firstValueSeconds, setFirstValueSeconds] = useState("");
  const [focusedTestCount, setFocusedTestCount] = useState("0");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAttempts = parseInteger(attempts, 1);
    const parsedFocusedTests = parseInteger(focusedTestCount, 0);
    const parsedFirstValue =
      firstValueSeconds.trim() === ""
        ? undefined
        : parseInteger(firstValueSeconds, 0);
    if (
      parsedAttempts === undefined ||
      parsedFocusedTests === undefined ||
      (parsedFirstValue === undefined && firstValueSeconds.trim() !== "")
    ) {
      setError("Use whole-number counts; attempts starts at 1.");
      return;
    }
    const profile = PROFILES.find((item) => item.key === profileKey);
    if (!profile) {
      setError("Choose a supported local agent profile.");
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      await onRecord({
        snapshot_id: snapshotId,
        task_type: "continuation",
        tool: profile.tool,
        model: profile.model,
        role: guide.role,
        outcome_status: outcomeStatus,
        accepted_recommendation: acceptedRecommendation,
        attempts: parsedAttempts,
        ...(parsedFirstValue === undefined
          ? {}
          : { first_value_seconds: parsedFirstValue }),
        focused_test_count: parsedFocusedTests,
      });
      setSaved(true);
    } catch {
      setError(
        "Local run was not recorded. Check the local service, then retry.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="agent-guide-capture">
      <summary>Record this run</summary>
      <form aria-label="Agent guide run capture" onSubmit={submit}>
        <p>
          Record only the chosen profile and outcome after a meaningful
          checkpoint. Prompt bodies, responses, paths, and provider cost are not
          collected.
        </p>
        <div className="agent-guide-capture-grid">
          <label>
            <span>Profile used</span>
            <select
              name="agent-guide-profile"
              onChange={(event) =>
                setProfileKey(event.target.value as ProfileKey)
              }
              value={profileKey}
            >
              {PROFILES.map((profile) => (
                <option key={profile.key} value={profile.key}>
                  {profile.tool} · {profile.model}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Outcome</span>
            <select
              name="agent-guide-outcome"
              onChange={(event) =>
                setOutcomeStatus(
                  event.target.value as AgentGuideRunInput["outcome_status"],
                )
              }
              value={outcomeStatus}
            >
              <option value="unknown">Unknown</option>
              <option value="in_progress">In progress</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </label>
          <label>
            <span>Attempts</span>
            <input
              min="1"
              name="agent-guide-attempts"
              onChange={(event) => setAttempts(event.target.value)}
              type="number"
              value={attempts}
            />
          </label>
          <label>
            <span>First value (seconds)</span>
            <input
              min="0"
              name="agent-guide-first-value-seconds"
              onChange={(event) => setFirstValueSeconds(event.target.value)}
              placeholder="Optional"
              type="number"
              value={firstValueSeconds}
            />
          </label>
          <label>
            <span>Focused tests</span>
            <input
              min="0"
              name="agent-guide-focused-test-count"
              onChange={(event) => setFocusedTestCount(event.target.value)}
              type="number"
              value={focusedTestCount}
            />
          </label>
        </div>
        <label className="agent-guide-acceptance">
          <input
            checked={acceptedRecommendation}
            name="agent-guide-accepted-recommendation"
            onChange={(event) =>
              setAcceptedRecommendation(event.target.checked)
            }
            type="checkbox"
          />
          <span>I used the recommendation for this run.</span>
        </label>
        <div className="agent-guide-capture-actions">
          <button className="secondary-action" disabled={busy} type="submit">
            {busy ? "Recording..." : "Save local run"}
          </button>
          {saved && <span className="agent-guide-saved">Recorded</span>}
        </div>
        {error && <p role="alert">{error}</p>}
      </form>
    </details>
  );
}

function profileKeyFor(profile: GuideRecommendation["primary"]): ProfileKey {
  return `${profile.tool}:${profile.model}` as ProfileKey;
}

function parseInteger(value: string, minimum: number): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum ? parsed : undefined;
}
