import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function extractCodexMetrics({ events, elapsedMs }) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new Error("non-negative elapsedMs is required");
  }
  const usage = events.findLast(
    (event) => event?.type === "turn.completed" && event.usage,
  )?.usage;
  if (!usage) throw new Error("turn.completed usage is required");

  const commands = events.filter(
    (event) =>
      event?.type === "item.completed" &&
      event.item?.type === "command_execution",
  );
  return {
    elapsed_ms: elapsedMs,
    // Codex emits the schema-constrained result as its final value in this
    // protocol, so first usable value and completion coincide.
    time_to_first_value_ms: elapsedMs,
    tool_calls: commands.length,
    failed_tool_calls: commands.filter((event) => event.item.exit_code !== 0)
      .length,
    input_tokens: requiredUsageMetric(usage, "input_tokens"),
    cached_input_tokens: requiredUsageMetric(usage, "cached_input_tokens"),
    output_tokens: requiredUsageMetric(usage, "output_tokens"),
    reasoning_output_tokens: requiredUsageMetric(
      usage,
      "reasoning_output_tokens",
    ),
  };
}

function requiredUsageMetric(usage, key) {
  const value = usage[key];
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`invalid Codex usage metric: ${key}`);
  }
  return value;
}

function runCli() {
  const eventsPath = process.argv[2];
  const elapsedMs = Number(process.argv[3]);
  if (!eventsPath) {
    throw new Error("usage: usefulness-codex-metrics <events.jsonl> <elapsed-ms>");
  }
  const events = readFileSync(resolve(eventsPath), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  process.stdout.write(
    `${JSON.stringify(extractCodexMetrics({ events, elapsedMs }))}\n`,
  );
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  runCli();
}
