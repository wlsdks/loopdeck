import { describe, expect, it } from "vitest";

import { errorMessageOrDefault } from "./error-message.js";

describe("errorMessageOrDefault", () => {
  it("preserves API recovery detail from Error messages", () => {
    const error = new Error(
      "Loop memory approval failed (404): No loop snapshot found. Send one Codex or Claude Code prompt, run `promptlane coach`, then run `promptlane loop collect`.",
    );

    expect(errorMessageOrDefault(error, "Could not approve loop memory.")).toBe(
      "Loop memory approval failed (404): No loop snapshot found. Send one Codex or Claude Code prompt, run `promptlane coach`, then run `promptlane loop collect`.",
    );
  });

  it("uses the fallback for non-Error throws", () => {
    expect(errorMessageOrDefault("failed", "Could not approve loop memory.")).toBe(
      "Could not approve loop memory.",
    );
  });
});
