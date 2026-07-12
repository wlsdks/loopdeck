import type { FastifyInstance } from "fastify";

import { doctorClaudeCode, doctorCodex } from "../../cli/commands/doctor.js";
import { requireAppAccess, type ServerAuthConfig } from "../auth.js";

export type AgentReadinessRouteOptions = {
  auth: ServerAuthConfig;
  dataDir: string;
};

export function registerAgentReadinessRoutes(
  server: FastifyInstance,
  options: AgentReadinessRouteOptions,
): void {
  server.get("/api/v1/agent-readiness", async (request) => {
    requireAppAccess(request, options.auth);
    const [codex, claudeCode] = await Promise.all([
      doctorCodex({ dataDir: options.dataDir }),
      doctorClaudeCode({ dataDir: options.dataDir }),
    ]);

    return {
      data: {
        clients: [
          toSafeAgentReadiness("codex", codex),
          toSafeAgentReadiness("claude-code", claudeCode),
        ],
        privacy: {
          local_only: true,
          returns_raw_paths: false,
          returns_settings_bodies: false,
        },
      },
    };
  });
}

export function toSafeAgentReadiness(
  tool: "codex" | "claude-code",
  doctor:
    | Awaited<ReturnType<typeof doctorCodex>>
    | Awaited<ReturnType<typeof doctorClaudeCode>>,
) {
  return {
    tool,
    status: doctor.status,
    server_ok: doctor.server.ok,
    token_ok: doctor.token.ok,
    hook_ok: doctor.settings.ok,
    mcp_registered: doctor.mcp.registered,
    ingest: {
      state: doctor.ingest.state,
      verified: doctor.ingest.verified,
      ...(doctor.ingest.age_seconds === undefined
        ? {}
        : { age_seconds: doctor.ingest.age_seconds }),
    },
    next_action: doctor.next_actions[0] ?? "No follow-up action reported.",
  };
}
