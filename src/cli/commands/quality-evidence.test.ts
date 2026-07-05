import { describe, expect, it } from "vitest";

import { qualityEvidenceForCli } from "./quality-evidence.js";

describe("quality-evidence CLI command", () => {
  it("prints the PromptLane 9.5 quality evidence summary as JSON and text", () => {
    const json = qualityEvidenceForCli({ json: true });
    const parsed = JSON.parse(json) as {
      check: string;
      status: string;
      scorecard_axes: Array<{ id: string; status: string }>;
      blockers: Array<{ id: string; status: string }>;
      recommended_next_slices: Array<{
        id: string;
        priority: number;
        blocked_by_external_event: boolean;
      }>;
    };

    expect(parsed.check).toBe("promptlane_95_quality");
    expect(parsed.status).toBe("pending");
    expect(parsed.scorecard_axes).toHaveLength(7);
    expect(parsed.blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "scheduled_ui_patrol" }),
        expect.objectContaining({
          id: "native_dialog_approved_dogfood",
          status: "pending_operator_approval",
        }),
      ]),
    );
    expect(parsed.recommended_next_slices[0]).toMatchObject({
      id: "scheduled_ui_patrol_cron_review",
      priority: 90,
      blocked_by_external_event: true,
    });
    expect(parsed.recommended_next_slices).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "web_user_flow_current_main_evidence",
        }),
      ]),
    );
    expect(parsed.recommended_next_slices).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "privacy_raw_free_regression_sweep",
        }),
      ]),
    );
    expect(parsed.recommended_next_slices).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "codex_claude_setup_smoke_refresh",
        }),
      ]),
    );
    expect(json).not.toContain(process.cwd());

    const text = qualityEvidenceForCli();

    expect(text).toContain("PromptLane 9.5 quality evidence");
    expect(text).toContain("Status: pending");
    expect(text).toContain("Scorecard axes: 7");
    expect(text).toContain("Blockers: 9");
    expect(text).toContain("scheduled_ui_patrol");
    expect(text).toContain("native_dialog_approved_dogfood");
    expect(text).toContain("Recommended next slices");
    expect(text).toContain("scheduled_ui_patrol_cron_review");
    expect(text).toContain("corepack pnpm evidence:ui-patrol");
    expect(text).not.toContain("web_user_flow_current_main_evidence");
    expect(text).not.toContain("privacy_raw_free_regression_sweep");
    expect(text).not.toContain("codex_claude_setup_smoke_refresh");
    expect(text).toContain("external event: yes");
    expect(text).toContain("Privacy: local-only");
    expect(text).not.toContain(process.cwd());
  });

  it("fails closed when requireComplete is set and evidence is pending", () => {
    expect(() => qualityEvidenceForCli({ requireComplete: true })).toThrow(
      /promptlane_95_quality pending/,
    );
  });
});
