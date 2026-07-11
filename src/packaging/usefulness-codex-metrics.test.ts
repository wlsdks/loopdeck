import { describe, expect, it } from "vitest";

import {
  extractCodexMetrics,
  parseCodexEventLines,
} from "../../scripts/usefulness-codex-metrics.mjs";

describe("Codex usefulness metrics", () => {
  it("extracts raw-free cost and tool metrics from JSONL events", () => {
    const events = [
      {
        type: "item.completed",
        item: {
          type: "command_execution",
          exit_code: 0,
          aggregated_output: "private",
        },
      },
      {
        type: "item.completed",
        item: {
          type: "command_execution",
          exit_code: 1,
          aggregated_output: "private",
        },
      },
      {
        type: "item.completed",
        item: { type: "agent_message", text: "private response" },
      },
      {
        type: "turn.completed",
        usage: {
          input_tokens: 100,
          cached_input_tokens: 60,
          output_tokens: 20,
          reasoning_output_tokens: 5,
        },
      },
    ];

    expect(extractCodexMetrics({ events, elapsedMs: 1_500 })).toEqual({
      elapsed_ms: 1_500,
      time_to_first_value_ms: 1_500,
      tool_calls: 2,
      failed_tool_calls: 1,
      input_tokens: 100,
      cached_input_tokens: 60,
      output_tokens: 20,
      reasoning_output_tokens: 5,
    });
  });

  it("fails closed when final usage is missing", () => {
    expect(() => extractCodexMetrics({ events: [], elapsedMs: 10 })).toThrow(
      "turn.completed usage is required",
    );
  });

  it("ignores Codex CLI diagnostics outside the JSONL event stream", () => {
    expect(
      parseCodexEventLines(
        'Reading additional input from stdin...\n{"type":"turn.started"}\n',
      ),
    ).toEqual([{ type: "turn.started" }]);
  });

  it("still rejects malformed JSON-looking event lines", () => {
    expect(() => parseCodexEventLines('{"type":\n')).toThrow();
  });
});
