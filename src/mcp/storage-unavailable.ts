export function storageUnavailableMessage(error: unknown): string {
  const reason =
    error instanceof Error && "code" in error && typeof error.code === "string"
      ? ` Reason: ${error.code}.`
      : "";

  return `Local LoopRelay archive is not available. Run \`looprelay setup --profile coach --register-mcp\`, then submit one real Claude Code or Codex prompt. If capture still does not work, run \`looprelay doctor claude-code\` or \`looprelay doctor codex\`. For custom storage, initialize it with \`looprelay init --data-dir <path>\` and pass the same --data-dir to the MCP server.${reason}`;
}
