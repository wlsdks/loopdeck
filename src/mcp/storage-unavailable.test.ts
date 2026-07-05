import { describe, expect, it } from "vitest";

import { storageUnavailableMessage } from "./storage-unavailable.js";

describe("storageUnavailableMessage", () => {
  it("returns one raw-free MCP storage setup message", () => {
    const error = Object.assign(
      new Error(
        "ENOENT: no such file or directory, open '/Users/example/private/prompt-coach.sqlite'",
      ),
      { code: "ENOENT" },
    );

    const message = storageUnavailableMessage(error);

    expect(message).toBe(
      "Local PromptLane archive is not available. Run `prompt-coach setup --profile coach --register-mcp`, then submit one real Claude Code or Codex prompt. If capture still does not work, run `prompt-coach doctor claude-code` or `prompt-coach doctor codex`. For custom storage, initialize it with `prompt-coach init --data-dir <path>` and pass the same --data-dir to the MCP server. Reason: ENOENT.",
    );
    expect(message).not.toContain("Loopdeck");
    expect(message).not.toContain("/Users/example");
    expect(message).not.toContain("prompt-coach.sqlite");
  });

  it("does not include arbitrary error messages without a stable code", () => {
    const message = storageUnavailableMessage(
      new Error("open /tmp/private/archive.sqlite failed"),
    );

    expect(message).toBe(
      "Local PromptLane archive is not available. Run `prompt-coach setup --profile coach --register-mcp`, then submit one real Claude Code or Codex prompt. If capture still does not work, run `prompt-coach doctor claude-code` or `prompt-coach doctor codex`. For custom storage, initialize it with `prompt-coach init --data-dir <path>` and pass the same --data-dir to the MCP server.",
    );
    expect(message).not.toContain("Loopdeck");
    expect(message).not.toContain("/tmp/private");
  });
});
