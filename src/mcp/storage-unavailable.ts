export function storageUnavailableMessage(error: unknown): string {
  const reason =
    error instanceof Error && "code" in error && typeof error.code === "string"
      ? ` Reason: ${error.code}.`
      : "";

  return `Local PromptLane archive is not available. Run \`prompt-coach setup --profile coach --register-mcp\`, then submit one real Claude Code or Codex prompt. If capture still does not work, run \`prompt-coach doctor claude-code\` or \`prompt-coach doctor codex\`. For custom storage, initialize it with \`prompt-coach init --data-dir <path>\` and pass the same --data-dir to the MCP server.${reason}`;
}
