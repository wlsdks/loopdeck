import { useEffect, useState } from "react";
import { getAgentGuide, type AgentGuideResponse } from "./api.js";

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
      <div className="panel">
        <h2>Agent guide</h2>
        <p>{guide.next_action}</p>
      </div>
    );
  return (
    <div className="panel">
      <h2>Agent guide</h2>
      <p>
        <strong>
          {guide.primary.tool} {guide.primary.model}
        </strong>{" "}
        · {guide.role} · {guide.confidence} confidence
      </p>
      <p>{guide.reasons.join(" ")}</p>
      <p>Switch: {guide.switch_condition}</p>
      <p>
        Evidence: {guide.evidence.passing_runs}/{guide.evidence.completed_runs}{" "}
        passing local runs. LoopRelay never switches models automatically.
      </p>
    </div>
  );
}
