import assert from "node:assert/strict";
import test from "node:test";

import { parserPlan } from "../src/parser-plan.js";

test("parser approach remains undecided", () => {
  assert.deepEqual(parserPlan(), { approach: "undecided" });
});
