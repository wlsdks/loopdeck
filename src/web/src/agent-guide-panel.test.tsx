import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AgentGuideRunCapture } from "./agent-guide-panel.js";

describe("AgentGuideRunCapture", () => {
  it("keeps guide adoption and raw-free outcome capture in the selected loop", () => {
    const html = renderToStaticMarkup(
      createElement(AgentGuideRunCapture, {
        snapshotId: "loop_safe123",
        guide: {
          role: "implement",
          primary: { tool: "codex", model: "gpt-5.6-terra" },
          alternative: { tool: "claude-code", model: "sonnet" },
          reasons: ["Scoped continuation has a selected local checkpoint."],
          switch_condition: "Escalate after repeated blocked attempts.",
          confidence: "low",
          evidence: {
            completed_runs: 0,
            passing_runs: 0,
            non_passing_runs: 0,
          },
          privacy: {
            local_only: true,
            external_calls: false,
            auto_switches_model: false,
          },
        },
        onRecord: async () => undefined,
      }),
    );

    expect(html).toContain("Record this run");
    expect(html).toContain("Profile used");
    expect(html).toContain("Outcome");
    expect(html).toContain("First value (seconds)");
    expect(html).toContain("I used the recommendation for this run.");
    expect(html).toContain(
      "Prompt bodies, responses, paths, and provider cost",
    );
    expect(html).toContain('name="agent-guide-profile"');
    expect(html).not.toContain("/Users/");
  });
});
