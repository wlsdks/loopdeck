import { describe, expect, it } from "vitest";

import { readTarballName } from "../../scripts/npm-pack-output.mjs";

describe("readTarballName", () => {
  it("extracts npm pack JSON after lifecycle output", () => {
    const stdout = [
      "> looprelay@1.0.0 build /tmp/looprelay",
      "> pnpm clean && pnpm build:server && pnpm build:web",
      "vite build complete",
      '[{"filename":"looprelay-1.0.0.tgz"}]',
      "",
    ].join("\n");

    expect(readTarballName(stdout)).toBe("looprelay-1.0.0.tgz");
  });

  it("rejects output without a valid tarball result", () => {
    expect(() => readTarballName("build complete\n[]\n")).toThrow(
      "npm pack did not return a tarball filename",
    );
  });
});
