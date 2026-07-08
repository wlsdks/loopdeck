import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

describe("npm publish preflight", () => {
  it("points the operator to npm login when npm auth is the remaining blocker", () => {
    const binDir = mkdtempSync(join(tmpdir(), "promptlane-fake-npm-"));
    const fakeNpm = join(binDir, "npm");
    writeFileSync(
      fakeNpm,
      `#!/usr/bin/env sh
if [ "$1" = "whoami" ]; then
  echo "npm ERR! code E401" >&2
  exit 1
fi
if [ "$1" = "view" ]; then
  echo "npm ERR! code E404" >&2
  exit 1
fi
echo "unexpected npm command: $*" >&2
exit 1
`,
      { mode: 0o755 },
    );

    const result = spawnSync(
      process.execPath,
      [
        "scripts/npm-publish-preflight.mjs",
        "--json",
        "--skip-git-clean",
        "--skip-git-tag",
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PATH: `${binDir}:${process.env.PATH ?? ""}`,
        },
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    expect(result.status).toBe(1);
    const parsed = JSON.parse(result.stdout) as {
      status: string;
      next_action: string;
      checks: Array<{ label: string; ok: boolean }>;
    };
    expect(parsed.status).toBe("blocked");
    expect(parsed.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "npm authentication is available",
          ok: false,
        }),
      ]),
    );
    expect(parsed.next_action).toContain("npm login");
    expect(parsed.next_action).toContain("corepack pnpm npm-publish:preflight");
    expect(parsed.next_action).toContain("npm publish --tag latest");
  });
});
