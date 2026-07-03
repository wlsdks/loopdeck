import type { LoopMemory } from "../storage/loop-memories.js";

export type InstructionPatchTargetFile = "AGENTS.md" | "CLAUDE.md";

export type InstructionPatchProposal = {
  target_file: InstructionPatchTargetFile;
  patch_kind: "append_section";
  title: string;
  diff: string;
  writes_files: false;
  requires_user_approval: true;
  source_memory_id: string;
  next_action: string;
  privacy: {
    local_only: true;
    external_calls: false;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    writes_instruction_files: false;
  };
};

export function proposeInstructionPatchFromMemory(input: {
  memory: LoopMemory;
  targetFile: string;
}): InstructionPatchProposal {
  const targetFile = parseInstructionPatchTarget(input.targetFile);
  const statement = safePatchLine(input.memory.statement);
  const evidenceRefs = input.memory.evidence_refs.map(safePatchLine);
  const evidence =
    evidenceRefs.length > 0 ? evidenceRefs.join(", ") : "approved-loop-memory";
  const approvedBy = safePatchLine(input.memory.approved_by);
  const sourceMemoryId = safePatchLine(input.memory.id);
  const patchLines = [
    `--- a/${targetFile}`,
    `+++ b/${targetFile}`,
    "@@",
    "+## Loopdeck Memories",
    "+",
    `+- ${statement}`,
    `+  evidence: ${evidence}`,
    `+  approved_by: ${approvedBy}`,
    `+  source_memory: ${sourceMemoryId}`,
  ];

  return {
    target_file: targetFile,
    patch_kind: "append_section",
    title: `Append approved Loopdeck memory to ${targetFile}`,
    diff: `${patchLines.join("\n")}\n`,
    writes_files: false,
    requires_user_approval: true,
    source_memory_id: input.memory.id,
    next_action:
      "review this patch proposal, then apply it manually only if the instruction belongs in the project",
    privacy: {
      local_only: true,
      external_calls: false,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
      writes_instruction_files: false,
    },
  };
}

export function parseInstructionPatchTarget(
  targetFile: string,
): InstructionPatchTargetFile {
  if (targetFile === "AGENTS.md" || targetFile === "CLAUDE.md") {
    return targetFile;
  }
  throw new Error("Instruction patch target must be AGENTS.md or CLAUDE.md.");
}

function safePatchLine(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (looksUnsafe(normalized)) {
    throw new Error(
      "Instruction patch proposal must not include raw paths or secrets.",
    );
  }
  return normalized || "n/a";
}

function looksUnsafe(value: string): boolean {
  return (
    /(?:^|\s)\/Users\/[^\s]+/.test(value) ||
    /(?:^|\s)\/home\/[^\s]+/.test(value) ||
    /sk-[a-z0-9_-]{6,}/i.test(value) ||
    /gh[pousr]_[a-z0-9_]{12,}/i.test(value)
  );
}
