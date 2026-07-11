import assert from "node:assert/strict";
import test from "node:test";

import { retryPolicy } from "../src/retry-policy.js";

test("retry policy remains explicitly undecided", () => {
  assert.deepEqual(retryPolicy(), { mode: "undecided" });
});
