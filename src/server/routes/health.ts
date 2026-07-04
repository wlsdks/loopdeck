import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";

import { VERSION } from "../../shared/version.js";

// Stable for the lifetime of this server process. A new value is minted on
// every boot, so clients (e.g. the SessionStart hook) can tell whether they
// are talking to the same running server they already opened the web UI for.
const INSTANCE_ID = randomUUID();

export function registerHealthRoutes(server: FastifyInstance): void {
  server.get("/api/v1/health", async () => ({
    ok: true,
    version: VERSION,
    instance_id: INSTANCE_ID,
  }));
}
