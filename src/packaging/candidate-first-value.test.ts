import { describe, expect, it } from "vitest";

import { assessFirstValue } from "../../scripts/candidate-first-value-smoke.mjs";

describe("candidate first-value smoke assessment", () => {
  it("accepts a raw-free checkpoint and continuation brief", () => {
    const result = assessFirstValue({
      checkpoint: {
        snapshot: {
          outcome: {
            status: "in_progress",
            summary:
              "Continue independent first-value validation and verify the local brief.",
          },
        },
        privacy: {
          stores_prompt_bodies: false,
          stores_raw_paths: false,
        },
      },
      brief: {
        prompt:
          "Continue independent first-value validation and verify the local brief.",
      },
      protectedPaths: ["/private/isolated"],
    });

    expect(result).toEqual({ first_value_success: true, raw_path_hits: 0 });
  });

  it("fails closed when the product result exposes an isolated path", () => {
    const result = assessFirstValue({
      checkpoint: {
        snapshot: {
          outcome: {
            status: "in_progress",
            summary:
              "Continue independent first-value validation and verify the local brief.",
          },
        },
        privacy: {
          stores_prompt_bodies: false,
          stores_raw_paths: false,
        },
      },
      brief: { prompt: "Use /private/isolated for the next step." },
      protectedPaths: ["/private/isolated"],
    });

    expect(result).toEqual({ first_value_success: false, raw_path_hits: 1 });
  });
});
