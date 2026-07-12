import type { Command } from "commander";

import { loadHookAuth, loadLoopRelayConfig } from "../../config/config.js";
import { parseLoopOutcomeInput } from "../../loop/outcome.js";
import {
  hasAmbiguousLoopSnapshotTarget,
  hasLoopSnapshotSelection,
  selectLoopSnapshotTarget,
  selectedLoopSnapshotNotFoundMessage,
} from "../../loop/snapshot-selection.js";
import type { LoopEvidence } from "../../loop/evidence.js";
import type { UpdateContinuationReceiptInput } from "../../storage/continuation-receipts.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { UserError } from "../user-error.js";

type CloseOptions = {
  branch?: string;
  dataDir?: string;
  deviationReason?: string;
  evidenceRef?: string[];
  firstActionCorrect?: string;
  firstValueSeconds?: string;
  frictionScore?: string;
  json?: boolean;
  receiptId?: string;
  receiptStatus?: string;
  session?: string;
  snapshotId?: string;
  status?: string;
  summary?: string;
  targetCorrect?: string;
  typedEvidence?: string[];
  usedImprovementPrompt?: string[];
  worktree?: string;
};

export function registerLoopCloseCommand(loop: Command): void {
  loop
    .command("close")
    .description("Close one selected loop with outcome, evidence, and receipt.")
    .requiredOption("--status <status>", "Loop outcome status.")
    .requiredOption("--summary <summary>", "Raw-free outcome summary.")
    .option("--snapshot-id <id>", "Exact loop snapshot id.")
    .option("--worktree <name>", "Select a worktree snapshot.")
    .option("--session <id>", "Select a session snapshot.")
    .option("--branch <name>", "Select a branch snapshot.")
    .option(
      "--evidence-ref <ref>",
      "Compatibility evidence label; repeat as needed.",
      collect,
      [],
    )
    .option(
      "--typed-evidence <json>",
      "Typed evidence JSON object; repeat as needed.",
      collect,
      [],
    )
    .option(
      "--used-improvement-prompt <id>",
      "Attributed prompt id; repeat as needed.",
      collect,
      [],
    )
    .option("--receipt-id <id>", "Exact generated continuation receipt id.")
    .option(
      "--receipt-status <status>",
      "followed, partial, or ignored; defaults to followed.",
    )
    .option("--target-correct <yes|no>")
    .option("--first-action-correct <yes|no>")
    .option("--deviation-reason <reason>")
    .option("--first-value-seconds <seconds>")
    .option("--friction-score <0-3>")
    .option("--data-dir <path>")
    .option("--json", "Print JSON.")
    .action((options: CloseOptions) => console.log(loopCloseForCli(options)));
}

export function loopCloseForCli(options: CloseOptions = {}): string {
  const target = {
    snapshotId: options.snapshotId,
    worktree: options.worktree,
    sessionId: options.session,
    branch: options.branch,
  };
  if (!target.snapshotId && !hasLoopSnapshotSelection(target)) {
    throw new UserError(
      "Select the loop to close with --snapshot-id or worktree/session/branch filters.",
    );
  }
  if (hasAmbiguousLoopSnapshotTarget(target)) {
    throw new UserError(
      "Use either --snapshot-id or worktree/session/branch filters, not both.",
    );
  }
  const typedEvidence = parseTypedEvidenceOptions(options.typedEvidence ?? []);
  const parsed = parseLoopOutcomeInput({
    status: options.status,
    summary: options.summary,
    evidenceRefs: options.evidenceRef,
    usedImprovementPromptIds: options.usedImprovementPrompt,
    typedEvidence,
  });
  if (!parsed.ok) throw new UserError(parsed.message);
  const receipt = parseReceipt(options);
  const config = loadLoopRelayConfig(options.dataDir);
  const auth = loadHookAuth(options.dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: auth.web_session_secret,
  });
  try {
    const snapshot = selectLoopSnapshotTarget(
      storage.listLoopSnapshots({ limit: 100 }).items,
      target,
    );
    if (!snapshot) {
      throw new UserError(
        target.snapshotId
          ? `Loop snapshot not found: ${target.snapshotId}.`
          : selectedLoopSnapshotNotFoundMessage(target),
      );
    }
    let closed;
    try {
      closed = storage.closeLoop({
        snapshot_id: snapshot.id,
        outcome: parsed.outcome,
        ...(receipt ? { receipt } : {}),
      });
    } catch (error) {
      throw new UserError(
        error instanceof Error ? error.message : "Loop close failed.",
      );
    }
    if (!closed) throw new UserError("Selected loop snapshot not found.");
    const result = {
      closed: true as const,
      snapshot_id: closed.snapshot.id,
      outcome: closed.snapshot.outcome,
      ...(closed.receipt ? { receipt: closed.receipt } : {}),
      next_action: "review evidence before approving durable memory",
      privacy: {
        local_only: true as const,
        stores_prompt_bodies: false as const,
        stores_raw_paths: false as const,
        stores_transcripts: false as const,
        auto_approves_memory: false as const,
      },
    };
    return options.json
      ? JSON.stringify(result, null, 2)
      : `Closed ${result.snapshot_id} as ${result.outcome.status}.`;
  } finally {
    storage.close();
  }
}

function parseTypedEvidenceOptions(values: string[]): LoopEvidence[] {
  return values.map((value) => {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error();
      }
      return parsed as LoopEvidence;
    } catch {
      throw new UserError("--typed-evidence must be a JSON object.");
    }
  });
}

function parseReceipt(
  options: CloseOptions,
): { id: string; update: UpdateContinuationReceiptInput } | undefined {
  if (!options.receiptId) {
    if (
      options.receiptStatus ||
      options.targetCorrect ||
      options.firstActionCorrect ||
      options.deviationReason ||
      options.firstValueSeconds ||
      options.frictionScore
    ) {
      throw new UserError("Receipt metadata requires --receipt-id.");
    }
    return undefined;
  }
  const status = options.receiptStatus ?? "followed";
  if (status !== "followed" && status !== "partial" && status !== "ignored") {
    throw new UserError(
      "--receipt-status must be followed, partial, or ignored.",
    );
  }
  return {
    id: options.receiptId,
    update: {
      status,
      ...(options.targetCorrect
        ? { target_correct: yesNo(options.targetCorrect) }
        : {}),
      ...(options.firstActionCorrect
        ? { first_action_correct: yesNo(options.firstActionCorrect) }
        : {}),
      ...(options.deviationReason
        ? { deviation_reason: options.deviationReason }
        : {}),
      ...(options.firstValueSeconds
        ? {
            first_value_seconds: integer(
              options.firstValueSeconds,
              "--first-value-seconds",
              0,
            ),
          }
        : {}),
      ...(options.frictionScore
        ? {
            friction_score: integer(
              options.frictionScore,
              "--friction-score",
              0,
              3,
            ),
          }
        : {}),
    },
  };
}

function yesNo(value: string): boolean {
  if (value === "yes") return true;
  if (value === "no") return false;
  throw new UserError("Boolean close fields must be yes or no.");
}

function integer(
  value: string,
  option: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new UserError(
      `${option} must be an integer from ${minimum} to ${maximum}.`,
    );
  }
  return parsed;
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}
