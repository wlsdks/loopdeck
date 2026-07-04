import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

describe("source hygiene", () => {
  it("does not keep retired tool-brand references in tracked files", () => {
    const retiredToolBrand = ["se", "rena"].join("");

    let matches = "";
    try {
      matches = execFileSync(
        "git",
        ["grep", "-n", "-i", retiredToolBrand, "--", "."],
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        error.status === 1
      ) {
        matches = "";
      } else {
        throw error;
      }
    }

    expect(matches).toBe("");
  });
});
