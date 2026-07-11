import { describe, expect, it } from "vitest";

import { quoteForShell } from "./shell-quote.js";

describe("quoteForShell", () => {
  it("leaves shell-safe command arguments unquoted", () => {
    expect(quoteForShell("feature/branch-filter")).toBe(
      "feature/branch-filter",
    );
    expect(quoteForShell("looprelay")).toBe("looprelay");
    expect(quoteForShell("--data-dir")).toBe("--data-dir");
  });

  it("single-quotes command arguments with whitespace", () => {
    expect(quoteForShell("/tmp/looprelay custom")).toBe(
      "'/tmp/looprelay custom'",
    );
  });

  it("escapes embedded single quotes for copyable shell commands", () => {
    expect(quoteForShell("feature/missing 'loop'")).toBe(
      "'feature/missing '\\''loop'\\'''",
    );
  });
});
