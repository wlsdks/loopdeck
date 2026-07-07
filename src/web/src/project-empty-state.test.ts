import { describe, expect, it } from "vitest";

import { getProjectEmptyState } from "./project-empty-state.js";

describe("project empty state", () => {
  it("points first-run project records at the explicit coach setup flow", () => {
    expect(getProjectEmptyState()).toEqual({
      command: "promptlane setup --profile coach",
      title: "No project records yet.",
    });
  });
});
