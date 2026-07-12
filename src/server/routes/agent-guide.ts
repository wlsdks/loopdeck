import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  AGENT_GUIDE_MODELS,
  AGENT_GUIDE_OUTCOME_STATUSES,
  AGENT_GUIDE_ROLES,
  AGENT_GUIDE_TASK_TYPES,
  AGENT_GUIDE_TOOLS,
  recommendAgentStrategy,
} from "../../agent-guide/recommendation.js";
import type {
  AgentRunStoragePort,
  LoopSnapshotStoragePort,
} from "../../storage/ports.js";
import { requireAppAccess, type ServerAuthConfig } from "../auth.js";
import { problem } from "../errors.js";
import { requireStorageCapabilities } from "../storage-capabilities.js";

const querySchema = z.object({
  snapshot_id: z.string().min(1).optional(),
  task_type: z.enum(AGENT_GUIDE_TASK_TYPES),
  failed_attempts: z.coerce.number().int().min(0).optional(),
  worktree_count: z.coerce.number().int().min(0).optional(),
  requires_independent_review: z.coerce.boolean().optional(),
});

const recordRunSchema = z
  .object({
    snapshot_id: z.string().min(1),
    task_type: z.enum(AGENT_GUIDE_TASK_TYPES),
    tool: z.enum(AGENT_GUIDE_TOOLS),
    model: z.enum(AGENT_GUIDE_MODELS),
    role: z.enum(AGENT_GUIDE_ROLES),
    outcome_status: z.enum(AGENT_GUIDE_OUTCOME_STATUSES),
    accepted_recommendation: z.boolean(),
    attempts: z.number().int().min(1),
    first_value_seconds: z.number().int().min(0).optional(),
    focused_test_count: z.number().int().min(0),
  })
  .strict();

export function registerAgentGuideRoutes(
  server: FastifyInstance,
  options: {
    auth: ServerAuthConfig;
    storage: Partial<AgentRunStoragePort & LoopSnapshotStoragePort>;
  },
): void {
  server.get("/api/v1/agent-guide", async (request, reply) => {
    requireAppAccess(request, options.auth);
    const query = querySchema.parse(request.query);
    const storage = requireStorageCapabilities(
      options.storage,
      ["listAgentRuns", "listLoopSnapshots"],
      { label: "Agent guide storage", instance: request.url },
    );
    const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const snapshot = query.snapshot_id
      ? snapshots.find((item) => item.id === query.snapshot_id)
      : snapshots.at(0);
    const projectId = snapshot?.project_id;
    if (!projectId) {
      return reply.send({
        data: {
          status: "empty",
          next_action: query.snapshot_id
            ? "Select an available local loop snapshot before requesting model guidance."
            : "Create a local loop snapshot before requesting model guidance.",
          privacy: {
            local_only: true,
            external_calls: false,
            auto_switches_model: false,
          },
        },
      });
    }
    const guide = recommendAgentStrategy({
      taskType: query.task_type,
      failedAttempts: query.failed_attempts,
      worktreeCount: query.worktree_count,
      requiresIndependentReview: query.requires_independent_review,
      matchingRuns: storage
        .listAgentRuns({ projectId, taskType: query.task_type })
        .map((run) => ({ outcomeStatus: run.outcome_status })),
    });
    return reply.send({ data: guide });
  });

  server.post("/api/v1/agent-guide/runs", async (request, reply) => {
    requireAppAccess(request, options.auth, { csrf: true });
    const input = recordRunSchema.parse(request.body);
    const storage = requireStorageCapabilities(
      options.storage,
      ["recordAgentRun", "listLoopSnapshots"],
      { label: "Agent guide storage", instance: request.url },
    );
    const snapshot = storage
      .listLoopSnapshots({ limit: 100 })
      .items.find((item) => item.id === input.snapshot_id);
    if (!snapshot) {
      throw problem(
        404,
        "Not Found",
        "Loop snapshot not found. Refresh the local loop list before recording this run.",
        request.url,
      );
    }

    const run = storage.recordAgentRun({
      project_id: snapshot.project_id,
      ...input,
    });
    return reply.code(201).send({ data: run });
  });
}
