import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProjectWorkspace } from "./project-workspace.js";

describe("ProjectWorkspace", () => {
  it("keeps project continuity, evidence, and reversible policy controls together", () => {
    const html = renderToStaticMarkup(
      createElement(ProjectWorkspace, {
        instructionBusy: false,
        loops: {
          items: [
            {
              id: "loop_01",
              project_id: "proj_local123",
              created_at: "2026-07-12T00:00:00.000Z",
              tool: "codex",
              source: "hook",
              project: "sample-project",
              prompt_count: 2,
              used_improvement_prompt_ids: ["prmt_01"],
              top_gaps: [],
              outcome_status: "blocked",
            },
          ],
        } as never,
        onAnalyzeInstructions() {},
        onBack() {},
        onOpenLoop() {},
        onUpdatePolicy() {},
        project: {
          project_id: "proj_local123",
          label: "sample-project",
          path_kind: "project_root",
          prompt_count: 4,
          sensitive_count: 1,
          quality_gap_rate: 0.5,
          copied_count: 1,
          bookmarked_count: 0,
          feedback: { helpful: 1, not_helpful: 0, wrong: 0, total: 1 },
          policy: {
            capture_disabled: false,
            analysis_disabled: false,
            retention_candidate_days: 90,
            external_analysis_opt_in: false,
            export_disabled: false,
            version: 1,
          },
        },
      }),
    );

    expect(html).toContain("Local continuity workspace");
    expect(html).toContain("Review recovery");
    expect(html).toContain("Local project policy");
    expect(html).toContain("Anonymized export");
    expect(html).toContain("Retention review");
    expect(html).toContain("Review in 90 days");
    expect(html).toContain("External analysis permission");
    expect(html).toContain("makes no request");
    expect(html).toContain("Recommendation adoption");
    expect(html).toContain("Attributed in latest outcome");
    expect(html).not.toContain("/Users/");
  });
});
