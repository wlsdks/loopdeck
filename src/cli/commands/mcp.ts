import type { Command } from "commander";

import { runLoopRelayMcpServer } from "../../mcp/server.js";

type McpCliOptions = {
  dataDir?: string;
};

export function registerMcpCommand(program: Command): void {
  program
    .command("mcp")
    .description("Run the local LoopRelay MCP server over stdio.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .action(async (options: McpCliOptions) => {
      await runLoopRelayMcpServer({ dataDir: options.dataDir });
    });
}
