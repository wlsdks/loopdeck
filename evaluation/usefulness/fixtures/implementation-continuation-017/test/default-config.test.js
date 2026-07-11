import assert from "node:assert/strict";
import test from "node:test";

import { defaultConfig } from "../src/default-config.js";

test("uses safe defaults when input is absent", () => {
  assert.deepEqual(defaultConfig(undefined), {
    retries: 0,
    mode: "safe",
  });
});

test("preserves explicit configuration", () => {
  const value = { retries: 1, mode: "fast" };
  assert.equal(defaultConfig(value), value);
});
