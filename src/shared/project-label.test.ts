import { describe, expect, it } from "vitest";

import { deriveProjectLabel } from "./project-label.js";

describe("deriveProjectLabel", () => {
  it("derives a safe final segment from POSIX and backslash paths", () => {
    expect(deriveProjectLabel("  /Users/example/private-project/  ")).toBe(
      "private-project",
    );
    expect(
      deriveProjectLabel("  C:\\Users\\example\\private-project\\  "),
    ).toBe("private-project");
  });

  it("uses the caller fallback when the path has no segment", () => {
    expect(deriveProjectLabel("/", "project")).toBe("project");
    expect(deriveProjectLabel("  \\", "unknown")).toBe("unknown");
  });
});
