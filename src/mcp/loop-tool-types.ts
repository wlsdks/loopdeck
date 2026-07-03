import type { LoopOutcomeStatus } from "../loop/types.js";

export type GetLoopdeckStatusToolArguments = {
  include_latest?: boolean;
};

export type PrepareLoopBriefToolArguments = {
  latest?: boolean;
};

export type RecordLoopOutcomeToolArguments = {
  snapshot_id?: string;
  latest?: boolean;
  status: LoopOutcomeStatus;
  summary: string;
  evidence_refs?: string[];
};

export type LoopdeckToolPrivacy = {
  local_only: true;
  external_calls: false;
  returns_prompt_bodies: false;
  returns_raw_paths: false;
};

export type GetLoopdeckStatusToolResult = {
  status: "ready" | "empty" | "setup_needed";
  snapshot_count: number;
  latest_snapshot?: {
    id: string;
    created_at: string;
    tool: string;
    source: string;
    project: string;
    branch?: string;
    worktree?: string;
    prompt_count: number;
    average_prompt_score?: number;
    top_gaps: string[];
  };
  available_tools: string[];
  next_actions: string[];
  privacy: LoopdeckToolPrivacy;
};

export type PrepareLoopBriefToolResult =
  | {
      source: "latest";
      snapshot_id: string;
      title: string;
      prompt: string;
      next_action: string;
      privacy: LoopdeckToolPrivacy & {
        auto_submits: false;
      };
    }
  | {
      is_error: true;
      error_code: "invalid_input" | "not_found" | "storage_unavailable";
      message: string;
    };

export type RecordLoopOutcomeToolResult =
  | {
      recorded: true;
      snapshot_id: string;
      outcome: {
        status: LoopOutcomeStatus;
        summary: string;
        evidence_refs: string[];
      };
      next_action: string;
      privacy: LoopdeckToolPrivacy & {
        stores_prompt_bodies: false;
        stores_raw_paths: false;
      };
    }
  | {
      is_error: true;
      error_code: "invalid_input" | "not_found" | "storage_unavailable";
      message: string;
    };
