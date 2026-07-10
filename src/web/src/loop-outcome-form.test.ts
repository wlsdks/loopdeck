import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { LoopOutcomeForm } from "./loop-outcome-form.js";

describe("LoopOutcomeForm", () => {
  it("renders one explicit improvement-use checkbox per snapshot prompt id", () => {
    const html = renderToStaticMarkup(
      createElement(LoopOutcomeForm, {
        currentStatus: "passed",
        onRecord: vi.fn(),
        promptIds: ["prmt_one", "prmt_two"],
        snapshotId: "loop_web",
      }),
    );

    expect(html).toContain("PromptLane improvements used");
    expect(html).toContain('name="used-improvement-prmt_one"');
    expect(html).toContain('name="used-improvement-prmt_two"');
    expect(html).toContain("prmt_one");
    expect(html).toContain("prmt_two");
    expect(html).not.toContain("checked");
  });

  it("restores previously recorded attribution without selecting other prompts", () => {
    const html = renderToStaticMarkup(
      createElement(LoopOutcomeForm, {
        currentStatus: "passed",
        initialUsedImprovementPromptIds: ["prmt_two"],
        onRecord: vi.fn(),
        promptIds: ["prmt_one", "prmt_two"],
        snapshotId: "loop_web",
      }),
    );

    expect(html).toContain(
      'type="checkbox" name="used-improvement-prmt_two" checked=""',
    );
    expect(html).not.toContain(
      'type="checkbox" name="used-improvement-prmt_one" checked=""',
    );
  });
});
