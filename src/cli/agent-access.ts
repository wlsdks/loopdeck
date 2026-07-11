import { quoteForShell } from "../shared/shell-quote.js";

export type AgentTool = "claude-code" | "codex";

export type AgentCommandSpec = {
  command: string;
  args: string[];
};

export type LoopRelayEntry = {
  command: string;
  args: string[];
};

const DIST_CLI_PATTERN = /[/\\]dist[/\\]cli[/\\]index\.js$/;

export const PUBLISHED_LOOPRELAY_ENTRY: LoopRelayEntry = {
  command: "looprelay",
  args: [],
};

export const FIRST_PROMPT_NEXT_STEP =
  "Send one Codex or Claude Code prompt, then run looprelay coach.";

export function defaultLoopRelayEntry(): LoopRelayEntry {
  const cliPath = process.argv[1];
  if (typeof cliPath === "string" && DIST_CLI_PATTERN.test(cliPath)) {
    return { command: process.execPath, args: [cliPath] };
  }
  return { ...PUBLISHED_LOOPRELAY_ENTRY };
}

export function mcpRegistrationSpec(
  tool: AgentTool,
  entry: LoopRelayEntry = defaultLoopRelayEntry(),
): AgentCommandSpec {
  if (tool === "claude-code") {
    return {
      command: "claude",
      args: [
        "mcp",
        "add",
        "--transport",
        "stdio",
        "looprelay",
        "--",
        entry.command,
        ...entry.args,
        "mcp",
      ],
    };
  }

  return {
    command: "codex",
    args: [
      "mcp",
      "add",
      "looprelay",
      "--",
      entry.command,
      ...entry.args,
      "mcp",
    ],
  };
}

export function mcpListSpec(tool: AgentTool): AgentCommandSpec {
  if (tool === "claude-code") {
    return { command: "claude", args: ["mcp", "list"] };
  }

  return { command: "codex", args: ["mcp", "list"] };
}

export function mcpRegistrationCommand(
  tool: AgentTool,
  entry?: LoopRelayEntry,
): string {
  const spec = mcpRegistrationSpec(tool, entry);
  return [spec.command, ...spec.args].map(quoteForShell).join(" ");
}

export function doctorCommand(tool: AgentTool): string {
  return `looprelay doctor ${tool}`;
}
