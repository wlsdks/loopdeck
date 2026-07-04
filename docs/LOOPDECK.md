# Loopdeck Product Contract

Last updated: 2026-07-05

Loopdeck is the product direction for the current `prompt-coach` package.
During the compatibility window, the npm package, primary CLI, hook command,
Claude Code slash namespace, and canonical MCP server name remain
`prompt-coach`.

## Product Thesis

Loopdeck is a local-first agent loop memory and meta-prompting workbench for
Codex, Claude Code, and coding-agent workflows.

The product value is not just "score this prompt." The value is helping a
developer understand and improve the full coding-agent loop:

- what was asked
- which agent surface handled it
- which repo, worktree, branch, session, or thread it belonged to
- whether the loop produced evidence
- what should be asked next
- whether an approved memory or instruction update should be proposed

Loopdeck should make repeated agent work easier to review, continue, and improve
without turning into a hosted agent runtime.

## Product Name And Runtime IDs

Use this language consistently:

| Surface                     | Current value     | Rule                                           |
| --------------------------- | ----------------- | ---------------------------------------------- |
| Product name                | Loopdeck          | Use in README/product copy                     |
| npm package                 | `prompt-coach`    | Do not rename without a dedicated release plan |
| Primary CLI                 | `prompt-coach`    | Preserve for scripts, hooks, plugins, docs     |
| Product CLI alias           | `loopdeck`        | Safe for new manual terminal workflows         |
| Claude Code slash namespace | `/prompt-coach:*` | Preserve during compatibility window           |
| Future slash namespace      | `/loopdeck:*`     | Alias-only plan, not shipped yet               |
| MCP server name             | `prompt-coach`    | Preserve as canonical configured name          |
| GitHub repo                 | `wlsdks/loopdeck` | Product-facing repo name                       |

Do not introduce deprecation banners for `prompt-coach` runtime identifiers
until the deprecation readiness plan is satisfied.

## Primary Users

Loopdeck is for developers who already use agentic coding tools heavily:

- solo builders running Codex and Claude Code in parallel
- maintainers using worktrees and PR branches for multiple agent sessions
- developers who need repeatable follow-up prompts instead of ad-hoc Markdown
  notes
- users who want local-first memory without uploading prompt archives to a
  hosted service

The target user is comfortable with a CLI and local developer tooling. The web
UI should be operational and dense, not a marketing site.

## Core Workflows

### First Coach Loop

Goal: a new user sees one useful correction for a real prompt.

1. Install and run setup.
2. Send a real Codex or Claude Code prompt.
3. Run the coach workflow.
4. Review the score, gaps, and copy-ready improved draft.

Success criteria:

- setup is explicit
- nothing leaves the machine
- the user sees one actionable improvement
- no prompt is auto-submitted

### Agent Loop Continuation

Goal: a user can continue a coding-agent loop without manually rebuilding
context from scattered notes.

1. Loopdeck records prompt and loop metadata.
2. A hook, CLI command, or MCP tool creates a safe loop snapshot.
3. The user or active agent asks for a continuation brief.
4. Loopdeck returns a raw-free brief tied to the selected worktree/session/branch
   when filters are provided.

Success criteria:

- the brief references safe labels and prompt IDs, not raw transcript bodies
- selected worktree/session/branch filters do not fall back to unrelated latest
  activity
- the brief is copy/review first, not auto-submit

### Multi-Worktree Review

Goal: a user can see which parallel loops need review before deciding whether to
merge or continue.

1. Existing loop snapshots are grouped by safe worktree/session/branch metadata.
2. Loopdeck surfaces command-center summaries and review packets.
3. The user reviews readiness, missing evidence, and continuation commands.

Success criteria:

- no automatic merge, branch checkout, or conflict prediction
- no raw local paths or raw evidence strings in summary status
- review packets describe what a human should inspect next

### Memory And Instruction Improvement

Goal: recurring lessons become durable only after approval.

1. A loop outcome is recorded with passing status and safe evidence refs.
2. Loopdeck proposes a memory candidate.
3. The user approves the memory.
4. Loopdeck can propose an AGENTS.md or CLAUDE.md patch.
5. The user explicitly applies the patch through a gated CLI/MCP path.

Success criteria:

- failed or unevidenced loops are not accepted as durable memory
- memory approval does not write instruction files
- instruction patch proposal is reviewable and idempotent
- applying a patch requires explicit confirmation

## Feature Portfolio

Keep:

- local prompt capture
- redacted Markdown archive as human-readable source of truth
- SQLite index and FTS
- deterministic prompt scoring and improvement drafts
- MCP rewrite/judge flows mediated by the active user-controlled agent session
- web archive/detail/search/settings surfaces
- setup, doctor, status, hook, and smoke commands

Improve:

- loop snapshot model and status summaries
- continuation briefs
- worktree/session/branch filtering
- user-approved memory and instruction patch workflows
- setup/status diagnostics for Codex and Claude Code
- package/plugin docs around compatibility IDs

Do not expand now:

- `pc-claude` and `pc-codex` wrappers
- generic durable execution runtime
- semantic vector memory by default
- cloud/team sync
- external provider judge calls from inside Loopdeck
- raw transcript ingestion
- automatic prompt resubmission
- automatic merge/rebase/branch checkout

## Integration Contract

Codex and Claude Code are first-class runtime surfaces, not optional add-ons.

Loopdeck should integrate through:

- hooks for local capture and boundary metadata
- MCP for agent-readable local tools
- plugin/skill/slash-command packaging for setup and status workflows
- AGENTS.md and CLAUDE.md as instruction files
- explicit CLI commands for collection, scheduling, memory, and patch proposals

Loopdeck should not depend on:

- private app databases
- undocumented transcript storage
- provider credentials
- hidden hosted services
- raw local path disclosure

For detailed harness rules, see `docs/AGENT-HARNESS.md`.

## Data Model Summary

Loopdeck adds loop snapshots beside the existing prompt archive.

The archive stores redacted prompt bodies and prompt-level analysis. Loop
snapshots store references and safe summaries:

- prompt IDs
- safe cwd/project/worktree labels
- git root hashes where available
- branch/session/thread labels where available
- event counts
- prompt score aggregates
- outcome status and safe evidence refs
- continuation brief summary metadata
- privacy flags

For the full schema and storage contract, see
`docs/LOOP-SNAPSHOT-SCHEMA.md`.

## Autonomy Model

Loopdeck may become more helpful, but autonomy must remain staged.

| Level | Behavior                                    | Default                         |
| ----- | ------------------------------------------- | ------------------------------- |
| 0     | observe only                                | allowed                         |
| 1     | suggest a next prompt                       | allowed                         |
| 2     | draft a patch or instruction update         | allowed after eligible evidence |
| 3     | apply after explicit approval               | opt-in                          |
| 4     | run a gated local loop with stop conditions | future only                     |

Level 4 must remain local, non-destructive, bounded, and verified before it is
offered as a normal workflow.

## Product Non-Goals

Loopdeck is not:

- a hosted agent platform
- a LangGraph/Temporal replacement
- a team cloud memory backend
- a provider credential broker
- a hidden LLM judge service
- a project management suite
- an automatic merge bot

Use external agent-runtime ecosystems as design references for trace shape,
memory boundaries, and eval patterns. Do not reimplement them as the product.

## MVP Acceptance

The Loopdeck direction is healthy when these are true:

- a plain Codex or Claude Code user can get value through setup, capture, coach,
  status, and brief workflows
- every write path has an explicit local command or user-approved MCP argument
- prompt bodies remain in the redacted archive only
- loop snapshots and status surfaces remain raw-free
- instruction changes are proposed before they are applied
- compatibility IDs remain stable until a dedicated rename plan proves the
  migration
- tests and smoke commands cover each public runtime surface before release
