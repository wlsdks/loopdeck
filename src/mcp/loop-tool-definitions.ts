import type { PromptCoachMcpToolDefinition } from "./score-tool-definitions.js";

const LOCAL_LOOP_READ_ONLY_TOOL_ANNOTATIONS = {
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
  readOnlyHint: true,
} as const;

const LOOP_TOOL_PRIVACY_SCHEMA = {
  type: "object",
  required: [
    "local_only",
    "external_calls",
    "returns_prompt_bodies",
    "returns_raw_paths",
  ],
  properties: {
    local_only: { const: true },
    external_calls: { const: false },
    returns_prompt_bodies: { const: false },
    returns_raw_paths: { const: false },
  },
} as const;

const TOOL_ERROR_OUTPUT_SCHEMA = {
  type: "object",
  required: ["is_error", "error_code", "message"],
  properties: {
    is_error: { const: true },
    error_code: { type: "string" },
    message: { type: "string" },
  },
} as const;

export const GET_LOOPDECK_STATUS_TOOL_DEFINITION: PromptCoachMcpToolDefinition =
  {
    name: "get_loopdeck_status",
    description:
      "Check whether local Loopdeck loop snapshots are available for the current prompt-coach archive. Use this when Codex or Claude Code needs to know if a previous loop can be continued or whether the user should run `prompt-coach loop collect` first. Returns safe loop metadata, available loop tools, next actions, and privacy flags. It never returns prompt bodies, raw absolute paths, secrets, transcripts, or external LLM results.",
    annotations: {
      ...LOCAL_LOOP_READ_ONLY_TOOL_ANNOTATIONS,
      title: "Loopdeck loop status",
    },
    inputSchema: {
      type: "object",
      properties: {
        include_latest: {
          type: "boolean",
          description:
            "Whether to include safe metadata for the latest loop snapshot. Defaults to true.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      required: [
        "status",
        "snapshot_count",
        "available_tools",
        "next_actions",
        "privacy",
      ],
      properties: {
        status: { type: "string", enum: ["ready", "empty", "setup_needed"] },
        snapshot_count: { type: "integer", minimum: 0 },
        latest_snapshot: {
          type: "object",
          properties: {
            id: { type: "string" },
            created_at: { type: "string" },
            tool: { type: "string" },
            source: { type: "string" },
            project: { type: "string" },
            branch: { type: "string" },
            worktree: { type: "string" },
            prompt_count: { type: "integer", minimum: 0 },
            average_prompt_score: { type: "integer", minimum: 0, maximum: 100 },
            top_gaps: { type: "array", items: { type: "string" } },
          },
        },
        available_tools: { type: "array", items: { type: "string" } },
        next_actions: { type: "array", items: { type: "string" } },
        privacy: LOOP_TOOL_PRIVACY_SCHEMA,
      },
    },
  } as const;

export const PREPARE_LOOP_BRIEF_TOOL_DEFINITION: PromptCoachMcpToolDefinition =
  {
    name: "prepare_loop_brief",
    description:
      "Prepare a copy-ready continuation prompt from the latest local Loopdeck snapshot. Use this when Codex or Claude Code is resuming an agent loop, handing off work across sessions/worktrees, or needs the next prompt after `prompt-coach loop collect`. This is read-only and never auto-submits the prompt. It returns prompt ids and loop metadata only, never prompt bodies, raw paths, secrets, transcripts, or external LLM results.",
    annotations: {
      ...LOCAL_LOOP_READ_ONLY_TOOL_ANNOTATIONS,
      title: "Prepare Loopdeck continuation brief",
    },
    inputSchema: {
      type: "object",
      properties: {
        latest: {
          type: "boolean",
          description:
            "Use the latest local loop snapshot. Defaults to true; no other selection mode exists yet.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        source: { const: "latest" },
        snapshot_id: { type: "string" },
        title: { type: "string" },
        prompt: { type: "string" },
        next_action: { type: "string" },
        privacy: {
          ...LOOP_TOOL_PRIVACY_SCHEMA,
          required: [...LOOP_TOOL_PRIVACY_SCHEMA.required, "auto_submits"],
          properties: {
            ...LOOP_TOOL_PRIVACY_SCHEMA.properties,
            auto_submits: { const: false },
          },
        },
        is_error: TOOL_ERROR_OUTPUT_SCHEMA.properties.is_error,
        error_code: TOOL_ERROR_OUTPUT_SCHEMA.properties.error_code,
        message: TOOL_ERROR_OUTPUT_SCHEMA.properties.message,
      },
      oneOf: [
        {
          required: [
            "source",
            "snapshot_id",
            "title",
            "prompt",
            "next_action",
            "privacy",
          ],
        },
        TOOL_ERROR_OUTPUT_SCHEMA,
      ],
    },
  } as const;
