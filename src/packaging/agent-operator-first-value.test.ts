import { describe, expect, it } from "vitest";

import { assessAgentOperatorRun } from "../../scripts/agent-operator-first-value.mjs";

const summary =
  "Continue independent agent first-value validation and verify the local brief.";

describe("agent-operator first-value assessment", () => {
  it("accepts a completed raw-free agent checkpoint and brief", () => {
    expect(
      assessAgentOperatorRun({
        status: status(),
        brief: { prompt: summary },
        agentResult: {
          completed: true,
          recovery_count: 1,
          friction_count: 2,
        },
        protectedPaths: ["/private/agent-run"],
      }),
    ).toEqual({
      first_value_success: true,
      raw_path_hits: 0,
      recovery_count: 1,
      friction_count: 2,
    });
  });

  it("fails closed when the agent result exposes an isolated path", () => {
    expect(
      assessAgentOperatorRun({
        status: status(),
        brief: { prompt: "/private/agent-run" },
        agentResult: {
          completed: true,
          recovery_count: 0,
          friction_count: 0,
        },
        protectedPaths: ["/private/agent-run"],
      }),
    ).toEqual({
      first_value_success: false,
      raw_path_hits: 1,
      recovery_count: 0,
      friction_count: 0,
    });
  });
});

function status() {
  return {
    status: "ready",
    latest_snapshot: { outcome_status: "in_progress" },
    privacy: { returns_prompt_bodies: false, returns_raw_paths: false },
  };
}
