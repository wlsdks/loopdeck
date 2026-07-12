import { ensureSession, failApi, getApiCsrfToken } from "./api.js";

export type AgentGuideResponse =
  | {
      role: "plan" | "implement" | "fast_path" | "review";
      primary: { tool: "codex" | "claude-code"; model: string };
      alternative: { tool: "codex" | "claude-code"; model: string };
      reasons: string[];
      switch_condition: string;
      confidence: "low" | "medium" | "high";
      evidence: {
        completed_runs: number;
        passing_runs: number;
        non_passing_runs: number;
      };
      privacy: {
        local_only: true;
        external_calls: false;
        auto_switches_model: false;
      };
    }
  | {
      status: "empty";
      next_action: string;
      privacy: {
        local_only: true;
        external_calls: false;
        auto_switches_model: false;
      };
    };

export type AgentGuideRunInput = {
  snapshot_id: string;
  task_type:
    | "ambiguous_request"
    | "planning"
    | "implementation"
    | "debugging"
    | "mechanical"
    | "review"
    | "continuation";
  tool: "codex" | "claude-code";
  model:
    | "gpt-5.6-sol"
    | "gpt-5.6-terra"
    | "gpt-5.6-luna"
    | "opus"
    | "sonnet"
    | "haiku";
  role: "plan" | "implement" | "fast_path" | "review";
  outcome_status:
    | "unknown"
    | "in_progress"
    | "passed"
    | "failed"
    | "blocked"
    | "abandoned";
  accepted_recommendation: boolean;
  attempts: number;
  first_value_seconds?: number;
  focused_test_count: number;
};

export type AgentGuideRun = AgentGuideRunInput & {
  id: string;
  created_at: string;
  project_id: string;
};

export async function getAgentGuide(
  taskType: AgentGuideRunInput["task_type"] = "continuation",
  snapshotId?: string,
): Promise<AgentGuideResponse> {
  await ensureSession();
  const params = new URLSearchParams({ task_type: taskType });
  if (snapshotId) params.set("snapshot_id", snapshotId);
  const response = await fetch(`/api/v1/agent-guide?${params}`, {
    credentials: "same-origin",
  });
  if (!response.ok) await failApi(response, "Agent guide failed");
  const body = (await response.json()) as { data?: unknown };
  if (!body.data || typeof body.data !== "object") {
    throw new Error("Agent guide failed: Invalid response.");
  }
  return body.data as AgentGuideResponse;
}

export async function recordAgentGuideRun(
  input: AgentGuideRunInput,
): Promise<AgentGuideRun> {
  const csrfToken = await getApiCsrfToken();
  const response = await fetch("/api/v1/agent-guide/runs", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) await failApi(response, "Agent guide run failed");
  const body = (await response.json()) as { data?: unknown };
  if (!isAgentGuideRun(body.data)) {
    throw new Error("Agent guide run failed: Invalid response.");
  }
  return body.data;
}

function isAgentGuideRun(value: unknown): value is AgentGuideRun {
  if (!value || typeof value !== "object") return false;
  const run = value as Record<string, unknown>;
  return (
    typeof run.id === "string" &&
    typeof run.created_at === "string" &&
    typeof run.project_id === "string" &&
    typeof run.snapshot_id === "string" &&
    typeof run.task_type === "string" &&
    typeof run.tool === "string" &&
    typeof run.model === "string" &&
    typeof run.role === "string" &&
    typeof run.outcome_status === "string" &&
    typeof run.accepted_recommendation === "boolean" &&
    typeof run.attempts === "number" &&
    typeof run.focused_test_count === "number" &&
    (run.first_value_seconds === undefined ||
      typeof run.first_value_seconds === "number")
  );
}
