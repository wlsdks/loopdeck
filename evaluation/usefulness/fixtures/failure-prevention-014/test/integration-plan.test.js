import assert from "node:assert/strict";
import test from "node:test";

import { integrationPlan } from "../src/integration-plan.js";

test("integration strategy remains undecided", () => {
  assert.deepEqual(integrationPlan(), {
    retryStrategy: "undecided",
    maxAttempts: null,
  });
});
