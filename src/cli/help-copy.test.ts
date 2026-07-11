import { describe, expect, it } from "vitest";

import { createProgram } from "./index.js";

function helpFor(commandPath: string): string {
  const program = createProgram();
  const command = program.commands.find((candidate) => {
    return candidate.name() === commandPath;
  });
  if (!command) {
    throw new Error(`Missing command: ${commandPath}`);
  }
  return command.helpInformation();
}

function nestedHelpFor(commandPath: string, subcommandPath: string): string {
  const program = createProgram();
  const command = program.commands.find((candidate) => {
    return candidate.name() === commandPath;
  });
  const subcommand = command?.commands.find((candidate) => {
    return candidate.name() === subcommandPath;
  });
  if (!subcommand) {
    throw new Error(`Missing command: ${commandPath} ${subcommandPath}`);
  }
  return subcommand.helpInformation();
}

describe("CLI help copy", () => {
  it("presents the root command as the LoopRelay workbench while preserving the looprelay command id", () => {
    const help = createProgram().helpInformation();

    expect(help).toContain("Usage: looprelay");
    expect(help).toContain("Local continuity and evidence");
    expect(help).toContain("Codex");
    expect(help).toContain("Claude Code");
    expect(help).not.toContain(
      "Local-first prompt archive for AI coding tools.",
    );
  });

  it("presents local infrastructure commands as LoopRelay surfaces", () => {
    const help = [
      helpFor("server"),
      helpFor("mcp"),
      helpFor("install-hook"),
      helpFor("uninstall-hook"),
      helpFor("statusline"),
      helpFor("statusline-chain"),
      helpFor("install-statusline"),
      helpFor("uninstall-statusline"),
      helpFor("quality-evidence"),
      nestedHelpFor("service", "install"),
    ].join("\n");

    expect(help).toContain("Run the local LoopRelay HTTP server");
    expect(help).toContain("Run the local LoopRelay MCP server over stdio.");
    expect(help).toContain("Install the LoopRelay capture hook");
    expect(help).toContain("Uninstall the LoopRelay capture hook");
    expect(help).toContain("Render the LoopRelay status line");
    expect(help).toContain("combines LoopRelay with another tool");
    expect(help).toContain("Install the LoopRelay status line");
    expect(help).toContain("Uninstall the LoopRelay status line");
    expect(help).toContain("Report LoopRelay 9.5 quality evidence");
    expect(help).toContain(
      "Install a login service for the local LoopRelay server.",
    );
    expect(help).not.toContain("local looprelay HTTP server");
    expect(help).not.toContain("local looprelay MCP server");
    expect(help).not.toContain("looprelay capture hook");
    expect(help).not.toContain("looprelay status line");
    expect(help).not.toContain("local looprelay server");
  });
});
