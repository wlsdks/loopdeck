import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { QualityDashboard } from "./api.js";
import { InsightInventory } from "./insight-inventory.js";

describe("InsightInventory", () => {
  it("makes every archive-level insight signal visible without raw content", () => {
    const html = renderToStaticMarkup(
      createElement(InsightInventory, {
        dashboard: dashboardFixture(),
        onOpenEvidence: () => undefined,
        onOpenFilteredList: () => undefined,
        onOpenProjects: () => undefined,
        onSelect: () => undefined,
      }),
    );

    expect(html).toContain("Insight coverage");
    expect(html).toContain("Sources by tool");
    expect(html).toContain("Prompts by project");
    expect(html).toContain("Missing or weak fields");
    expect(html).toContain("Project quality profiles");
    expect(html).toContain("Reusable prompts");
    expect(html).toContain("Duplicate prompt groups");
    expect(html).toContain("Local-only summary");
    expect(html).toContain("prompt bodies withheld");
    expect(html).toContain("raw paths withheld");
    expect(html).toContain("Verification criteria");
    expect(html).toContain("browser-effectiveness");
    expect(html).toContain("2 matching captures");
    expect(html).not.toContain("secret prompt body");
    expect(html).not.toContain("/Users/example");
  });
});

function dashboardFixture(): QualityDashboard {
  return {
    total_prompts: 4,
    sensitive_prompts: 1,
    sensitive_ratio: 0.25,
    recent: { last_7_days: 3, last_30_days: 4 },
    trend: {
      daily: [
        {
          date: "2026-07-12",
          prompt_count: 3,
          quality_gap_count: 2,
          quality_gap_rate: 0.67,
          average_quality_score: 64,
          sensitive_count: 1,
        },
      ],
    },
    quality_score: {
      average: 64,
      max: 100,
      band: "needs_work",
      scored_prompts: 4,
    },
    distribution: {
      by_tool: [{ key: "codex", label: "Codex", count: 4, ratio: 1 }],
      by_project: [
        {
          key: "browser-effectiveness",
          label: "browser-effectiveness",
          count: 4,
          ratio: 1,
        },
      ],
    },
    missing_items: [
      {
        key: "verification_criteria",
        label: "Verification criteria",
        missing: 2,
        weak: 1,
        total: 4,
        rate: 0.75,
      },
    ],
    patterns: [],
    instruction_suggestions: [],
    useful_prompts: [
      {
        id: "prmt_reused",
        tool: "codex",
        cwd: "browser-effectiveness",
        received_at: "2026-07-12T00:00:00.000Z",
        copied_count: 2,
        bookmarked: true,
        tags: ["test"],
        quality_gaps: [],
      },
    ],
    duplicate_prompt_groups: [
      {
        group_id: "dup_safe",
        count: 2,
        latest_received_at: "2026-07-12T00:00:00.000Z",
        projects: ["browser-effectiveness"],
        prompts: [
          {
            id: "prmt_duplicate",
            tool: "codex",
            cwd: "browser-effectiveness",
            received_at: "2026-07-12T00:00:00.000Z",
            tags: ["test"],
            quality_gaps: [],
          },
        ],
      },
    ],
    project_profiles: [
      {
        key: "browser-effectiveness",
        label: "browser-effectiveness",
        prompt_count: 4,
        quality_gap_count: 3,
        quality_gap_rate: 0.75,
        average_quality_score: 64,
        sensitive_count: 1,
        copied_count: 2,
        bookmarked_count: 1,
        latest_received_at: "2026-07-12T00:00:00.000Z",
        top_gap: {
          key: "verification_criteria",
          label: "Verification criteria",
          count: 3,
        },
      },
    ],
    privacy: {
      local_only: true,
      external_calls: false,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
    },
  };
}
