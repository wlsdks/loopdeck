import { describe, expect, it } from "vitest";

import type { QualityDashboard } from "./api.js";
import {
  shouldLoadArchiveScore,
  shouldLoadCoachFeedback,
  shouldLoadDashboard,
} from "./dashboard-query.js";

const dashboardWith7Days = {
  trend: {
    daily: Array.from({ length: 7 }, (_, index) => ({
      date: `2026-07-0${index + 1}`,
      average_score: 0.8,
      prompt_count: 1,
    })),
  },
} as unknown as QualityDashboard;

describe("dashboard query", () => {
  it("loads dashboard data only for dashboard-backed views", () => {
    expect(shouldLoadDashboard("list", undefined, 7)).toBe(false);
    expect(shouldLoadDashboard("dashboard", undefined, 7)).toBe(true);
    expect(shouldLoadDashboard("coach", undefined, 7)).toBe(true);
  });

  it("reloads dashboard data when the cached trend window differs", () => {
    expect(shouldLoadDashboard("dashboard", dashboardWith7Days, 7)).toBe(false);
    expect(shouldLoadDashboard("dashboard", dashboardWith7Days, 30)).toBe(true);
  });

  it("loads archive score only for archive-score backed views", () => {
    expect(shouldLoadArchiveScore("list", false)).toBe(false);
    expect(shouldLoadArchiveScore("dashboard", false)).toBe(true);
    expect(shouldLoadArchiveScore("dashboard", true)).toBe(false);
    expect(shouldLoadArchiveScore("coach", false)).toBe(true);
  });

  it("loads coach feedback only for the dashboard view", () => {
    expect(shouldLoadCoachFeedback("coach", false)).toBe(false);
    expect(shouldLoadCoachFeedback("dashboard", false)).toBe(true);
    expect(shouldLoadCoachFeedback("dashboard", true)).toBe(false);
  });
});
