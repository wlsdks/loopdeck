import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createProjectKey } from "./project-id.js";

describe("createProjectKey", () => {
  it("derives a stable proj_ id from the same path + secret", () => {
    const a = createProjectKey("/Users/example/project", "secret");
    const b = createProjectKey("/Users/example/project", "secret");
    expect(a).toBe(b);
    expect(a).toMatch(/^proj_[0-9a-f]{24}$/);
  });

  it("yields different ids for different paths", () => {
    const a = createProjectKey("/Users/example/alpha", "secret");
    const b = createProjectKey("/Users/example/beta", "secret");
    expect(a).not.toBe(b);
  });

  it("yields different ids when the hmac secret rotates", () => {
    const a = createProjectKey("/Users/example/project", "secret-1");
    const b = createProjectKey("/Users/example/project", "secret-2");
    expect(a).not.toBe(b);
  });

  it("treats a symlinked project path as the same local project", () => {
    const root = mkdtempSync(join(tmpdir(), "looprelay-project-id-"));
    const source = join(root, "source");
    const alias = join(root, "alias");
    mkdirSync(source);
    symlinkSync(source, alias);

    try {
      expect(createProjectKey(alias, "secret")).toBe(
        createProjectKey(source, "secret"),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
