# Loopdeck Goal Audit - 2026-07-05

## Purpose

This audit checks the active long-running goal against the current `main`
state. It is not a release note and it does not mark the goal complete.

Goal under audit:

- evolve `prompt-coach` toward Loopdeck, a local-first agent loop memory and
  meta-prompting workbench
- finish strong product planning before broad development
- keep Codex and Claude Code as first-class integration surfaces
- decide what to keep, improve, defer, or reject
- preserve privacy/local-first boundaries
- maintain AGENTS.md, CLAUDE.md, and harness docs
- implement approved slices with TDD, verification, commits, pushes, and PRs

## Current Evidence

Verified repository state:

- GitHub repository: `wlsdks/loopdeck`
- Runtime compatibility IDs: package, CLI, hook command, Claude Code slash
  namespace, and canonical MCP server remain `prompt-coach`
- Latest merged main commit at audit time:
  `aa3a1b8 test: add approved native dialog dogfood harness (#343)`
- Open PRs at audit time: none
- Local and remote `main` matched at audit time

Verified CI and operational evidence:

- PR #340 centralized server route storage capability guards and passed
  `test (22)` and `test (24)` before merge.
- PR #341 installed Playwright Chromium before the `ui-patrol` workflow and
  passed `test (22)` and `test (24)` before merge.
- PR #342 added this goal audit and passed `test (22)` and `test (24)` before
  merge.
- PR #343 added an operator-approved native-dialog dogfood harness guarded by
  `PROMPT_COACH_NATIVE_DIALOG_APPROVED=1` and passed `test (22)` and `test
  (24)` before merge.
- `ui-patrol` workflow_dispatch run `28717201110` failed before #341 because
  the GitHub runner did not have Chromium installed.
- `ui-patrol` workflow_dispatch run `28717406758` succeeded after #341.
- Run `28717406758` uploaded `ui-patrol-screenshots` with 9 png files:
  archive, detail, dashboard, coach, projects, MCP, exports, settings desktop,
  and settings mobile.

## Requirement Audit

| Requirement | Current state | Evidence | Status |
| --- | --- | --- | --- |
| Product name and positioning | Loopdeck is the product direction while `prompt-coach` remains the compatibility runtime ID. | `docs/LOOPDECK.md`, `docs/superpowers/specs/2026-07-04-agent-loop-memory-design.md`, repo `wlsdks/loopdeck` | Satisfied for current compatibility window |
| Existing feature portfolio decision | Keep/improve/defer/reject decisions are documented. | Feature portfolio matrix in the design spec and `docs/LOOPDECK.md` | Satisfied for current slices |
| Codex and Claude Code first-class integration | Hook, MCP, instruction, plugin, smoke, and dogfood paths are documented and partially verified. The native-dialog dogfood command now refuses to open OS dialogs unless the operator approval env is set. | `docs/AGENT-HARNESS.md`, `AGENTS.md`, `CLAUDE.md`, MCP smoke scripts, native dogfood audits, `scripts/mcp-native-dialog-approved.mjs` | Mostly satisfied; real answered OS-dialog run still needs operator approval |
| Loop data model | Loop snapshot and memory schema contracts exist and runtime slices have landed. | `docs/LOOP-SNAPSHOT-SCHEMA.md`, loop CLI/MCP/web implementation, status and selected worktree slices | Satisfied for MVP loop metadata model |
| Privacy/local-first boundary | Prompt bodies stay in redacted archive; loop surfaces are raw-free; write paths are explicit. | `docs/LOOPDECK.md`, storage/server/MCP tests, route capability guard cleanup, MCP smoke audits | Satisfied for implemented paths |
| AGENTS.md/CLAUDE.md/harness docs | Cross-agent and Claude-specific instruction boundaries are separated. | `AGENTS.md`, `CLAUDE.md`, `docs/INSTRUCTION-FILES.md`, `docs/AGENT-HARNESS.md` | Satisfied for current compatibility window |
| Technical risk handling | Storage capability guard work and CI UI patrol evidence reduced known reliability gaps. | ADR 0002, PR #340, PR #341, `docs/NEXT_BACKLOG.md` | Active and improving |
| TDD implementation slices | Recent slices used focused RED tests, local gates, PR CI, and squash merges. | PR #340 and #341 tests/CI; `tasks/todo.md` | Satisfied for recent slices |
| UI patrol scheduled artifact | Manual workflow dispatch is verified; first scheduled cron artifact has not occurred yet. | Run `28717406758`; `.github/workflows/ui-patrol.yml` cron | Not yet complete as a scheduled-run requirement |
| Codex native dialog fallback | Safe no-dialog preflight, MCP elicitation smoke, and approval-gated harness refusal are verified; real OS/native ask UI dogfood is not run. | `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md`, `scripts/mcp-native-dialog-approved.mjs`, `package.json` | Pending explicit operator approval for the answered dialog run |
| MCP registry follow-up | Decision is documented to wait until a new MCP tool/schema change touches registration. | ADR 0001, `docs/NEXT_BACKLOG.md` | Deferred by design |

## Completion Decision

Do not mark the long-running goal complete yet.

The current codebase has made strong progress toward Loopdeck, and the planning
foundation is now good enough for continued slice-by-slice implementation. The
remaining work is not a single blocker, but goal completion still requires
evidence for the pending integration and operational items:

- first scheduled `ui-patrol` artifact after the cron actually runs
- operator-approved interactive Codex or Claude Code native ask UI dogfood, or
  an explicit decision to keep that path as optional evidence only. The
  approval-gated command now exists, but the real OS dialog path has not been
  executed.
- future MCP registry work only when a real tool/schema change creates the
  registration-surface trigger
- continued small TDD slices for any new Loopdeck runtime value

## Next Best Actions

1. Keep `main` clean and continue shipping small, evidence-backed slices.
2. After the next Monday cron, inspect the scheduled `ui-patrol` artifact and
   update `tasks/todo.md`.
3. Ask for explicit operator approval before opening a native OS dialog.
4. When approval is granted, run
   `PROMPT_COACH_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved`
   and record whether the final MCP response is `interaction_status:
   "answered"` without prompt-body leakage or external calls.
5. Avoid package/CLI/slash namespace renames until the dedicated migration plan
   is accepted and verified.
