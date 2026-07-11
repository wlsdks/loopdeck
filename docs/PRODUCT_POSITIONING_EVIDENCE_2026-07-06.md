# LoopRelay Product Positioning Evidence 2026-07-06

This document records current evidence for the LoopRelay product planning and
positioning 9.5 quality bar.

## Metadata Evidence

| Surface                | Evidence                                                                                                                                                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub repository      | `wlsdks/looprelay` description is `LoopRelay local-first coding-agent continuity and evidence layer for Codex, Claude Code, and long-running coding-agent work.`                                                                                                                                 |
| GitHub topics          | Includes `looprelay`, `agent-continuity`, `loop-engineering`, `evidence`, `local-first`, `codex`, `claude-code`, `mcp`, and `worktrees`. |
| npm package metadata   | `package.json#description`, `homepage`, `bugs`, `keywords`, and `publishConfig.access` use the single LoopRelay identity; keywords include `agent-continuity`, `loop-engineering`, `evidence`, and `local-first`, and publish access is `public`. |
| Codex plugin metadata  | `plugins/looprelay/.codex-plugin/plugin.json` uses `displayName: LoopRelay` and LoopRelay-first descriptions.                                                                                                                                                                     |
| Claude plugin metadata | `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` use LoopRelay-first descriptions.                                                                                                                                                                                |

## Product Contract Evidence

- `docs/LOOPRELAY.md` states the active product name, positioning, runtime
  compatibility IDs, feature portfolio keep/improve/build/defer/reject
  decisions, privacy boundaries, risk model, MVP slices, and autonomy model.
- `docs/superpowers/specs/2026-07-05-looprelay-repositioning-design.md`
  records why `LoopRelay` and `LoopRelay` were rejected as primary product
  names and why LoopRelay is the active service name.
- `docs/LOOPRELAY.md` and `docs/LOOPRELAY-RUNTIME-SURFACES.md` keep LoopRelay as
  historical terminology and compatibility-only surface.
- `docs/LOOPRELAY_GOAL_AUDIT_2026-07-05.md` records product name,
  positioning, feature portfolio, data model, privacy boundary, harness docs,
  technical risk handling, and TDD implementation slices as satisfied for the
  current compatibility window.
- `docs/NEXT_BACKLOG.md` keeps the operational queue aligned with LoopRelay as
  prompt improvement first and loop-aware continuation second.

## Interpretation

The product planning and positioning axis is ready for 9.5/10 because the
current first-screen README, package metadata, Codex plugin metadata, Claude
plugin metadata, GitHub repository metadata, product contract, backlog, and
goal audit all point to the same product shape:

- LoopRelay is the product name.
- `looprelay` remains the compatibility runtime ID.
- Prompt improvement is the first value.
- Loop/worktree/session features are loop-aware continuation for better next
  prompts, not a separate loop-engineering product.
- LoopRelay is historical or compatibility-only terminology.
- Hidden provider calls, transcript scraping, automatic resubmission, and
  automatic merge behavior remain rejected.
