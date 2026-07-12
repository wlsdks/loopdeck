import type Database from "better-sqlite3";

import type { LoopSnapshot } from "../loop/types.js";
import type {
  ContinuationReceipt,
  UpdateContinuationReceiptInput,
} from "./continuation-receipts.js";
import {
  getContinuationReceipt,
  updateContinuationReceipt,
} from "./continuation-receipts.js";
import { recordLoopOutcome } from "./loop-snapshots.js";

export type CloseLoopInput = {
  snapshot_id: string;
  outcome: LoopSnapshot["outcome"];
  receipt?: {
    id: string;
    update: UpdateContinuationReceiptInput;
  };
};

export type CloseLoopResult = {
  snapshot: LoopSnapshot;
  receipt?: ContinuationReceipt;
};

export function closeLoop(
  db: Database.Database,
  input: CloseLoopInput,
  now: Date,
): CloseLoopResult | undefined {
  return db.transaction(() => {
    if (input.receipt) {
      const existing = getContinuationReceipt(db, input.receipt.id);
      if (!existing) throw new Error("Continuation receipt not found.");
      if (existing.snapshot_id !== input.snapshot_id) {
        throw new Error(
          "Continuation receipt must belong to the selected loop snapshot.",
        );
      }
    }
    const snapshot = recordLoopOutcome(db, input.snapshot_id, input.outcome);
    if (!snapshot) return undefined;
    const receipt = input.receipt
      ? updateContinuationReceipt(
          db,
          input.receipt.id,
          input.receipt.update,
          now,
        )
      : undefined;
    return { snapshot, ...(receipt ? { receipt } : {}) };
  })();
}
