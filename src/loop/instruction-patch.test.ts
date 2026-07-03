import { describe, expect, it } from "vitest";

import { proposeInstructionPatchFromMemory } from "./instruction-patch.js";
import type { LoopMemory } from "../storage/loop-memories.js";

describe("proposeInstructionPatchFromMemory", () => {
  it("builds a reviewable AGENTS.md patch proposal without writing files", () => {
    const proposal = proposeInstructionPatchFromMemory({
      memory: loopMemory({
        statement:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:568e2b4", "test:pnpm test"],
      }),
      targetFile: "AGENTS.md",
    });

    expect(proposal).toMatchObject({
      target_file: "AGENTS.md",
      writes_files: false,
      requires_user_approval: true,
      patch_kind: "append_section",
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        writes_instruction_files: false,
      },
    });
    expect(proposal.diff).toContain("--- a/AGENTS.md");
    expect(proposal.diff).toContain("+++ b/AGENTS.md");
    expect(proposal.diff).toContain("## Loopdeck Memories");
    expect(proposal.diff).toContain(
      "Scheduler lifecycle should stay plist-only",
    );
    expect(proposal.diff).toContain("evidence: commit:568e2b4, test:pnpm test");
    expect(proposal.next_action).toContain("review");
    expect(JSON.stringify(proposal)).not.toContain("/Users/example");
    expect(JSON.stringify(proposal)).not.toContain("Make this better");
  });

  it("rejects unsupported instruction targets", () => {
    expect(() =>
      proposeInstructionPatchFromMemory({
        memory: loopMemory(),
        targetFile: "README.md",
      }),
    ).toThrow("Instruction patch target must be AGENTS.md or CLAUDE.md.");
  });
});

function loopMemory(patch: Partial<LoopMemory> = {}): LoopMemory {
  return {
    id: "mem_123",
    snapshot_id: "loop_123",
    title: "Remember loop outcome for private-project",
    statement:
      "Use focused tests before full verification for loop memory changes.",
    evidence_refs: ["commit:568e2b4"],
    approved_by: "user",
    created_at: "2026-07-04T02:00:00.000Z",
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      writes_instruction_files: false,
      external_calls: false,
    },
    ...patch,
  };
}
