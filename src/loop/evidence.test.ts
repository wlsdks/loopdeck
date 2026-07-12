import { describe, expect, it } from "vitest";

import { parseLoopEvidence } from "./evidence.js";

describe("parseLoopEvidence", () => {
  it("accepts raw-free typed evidence with optional HEAD attribution", () => {
    expect(
      parseLoopEvidence([
        {
          kind: "test",
          label: "focused continuation receipt tests",
          observed_at: "2026-07-12T02:00:00.000Z",
          result: "passed",
          verification: "locally_verified",
          head_hash: "83b1c6f2",
        },
      ]),
    ).toEqual({
      ok: true,
      evidence: [
        {
          kind: "test",
          label: "focused continuation receipt tests",
          observed_at: "2026-07-12T02:00:00.000Z",
          result: "passed",
          verification: "locally_verified",
          head_hash: "83b1c6f2",
        },
      ],
    });
  });

  it("rejects raw paths, invalid dates, and arbitrary verification states", () => {
    expect(
      parseLoopEvidence([
        {
          kind: "test",
          label: "Read /Users/example/private.log",
          observed_at: "2026-07-12T02:00:00.000Z",
          result: "passed",
          verification: "locally_verified",
        },
      ]),
    ).toMatchObject({ ok: false });
    expect(
      parseLoopEvidence([
        {
          kind: "test",
          label: "focused tests",
          observed_at: "today",
          result: "passed",
          verification: "trusted",
        },
      ]),
    ).toMatchObject({ ok: false });
  });
});
