import { describe, expect, it } from "vitest";

import { parseLoopOutcomeInput } from "./outcome.js";

describe("loop outcome input", () => {
  it("normalizes a completed raw-free outcome", () => {
    expect(
      parseLoopOutcomeInput({
        status: "passed",
        summary: "  Focused tests and package smoke passed.  ",
        evidenceRefs: [" test:focused ", "commit:abc1234", "test:focused"],
      }),
    ).toEqual({
      ok: true,
      outcome: {
        status: "passed",
        summary: "Focused tests and package smoke passed.",
        evidence_refs: ["test:focused", "commit:abc1234"],
      },
    });
  });

  it("rejects unsupported status and empty summary without echoing input", () => {
    expect(
      parseLoopOutcomeInput({
        status: "private-status",
        summary: "",
        evidenceRefs: [],
      }),
    ).toEqual({
      ok: false,
      message:
        "Loop outcome status must be unknown, in_progress, passed, failed, blocked, or abandoned.",
    });
  });

  it("rejects secrets and raw paths before persistence", () => {
    expect(
      parseLoopOutcomeInput({
        status: "passed",
        summary: "Result stored at /Users/example/private/result.log.",
        evidenceRefs: ["token:sk-proj-abcdefghijklmnop"],
      }),
    ).toEqual({
      ok: false,
      message:
        "Loop outcome summary and evidence refs must not include secrets or raw local paths.",
    });
  });
});
