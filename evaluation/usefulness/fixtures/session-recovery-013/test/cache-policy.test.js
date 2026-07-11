import assert from "node:assert/strict";
import test from "node:test";

import { cachePolicy } from "../src/cache-policy.js";

test("cache policy remains explicitly undecided", () => {
  assert.deepEqual(cachePolicy(), { mode: "undecided" });
});
