# LoopRelay Runtime Surfaces

Last updated: 2026-07-11

LoopRelay has one product and runtime identity. There is no public compatibility
alias.

Product name: LoopRelay.

## Canonical Identity

- Product: **LoopRelay**
- npm package and CLI: `looprelay`
- helper binaries: `lr-claude`, `lr-codex`
- MCP server: `looprelay`
- MCP readiness tool: `get_looprelay_status`
- Claude Code slash namespace: `/looprelay:*`
- Codex plugin and skill: `looprelay`
- local data directory: `~/.looprelay`
- SQLite database: `~/.looprelay/looprelay.sqlite`
- GitHub repository: `wlsdks/looprelay`

## Product Contract

LoopRelay is the local continuity and evidence layer for long-running Codex and
Claude Code loops. Its primary surfaces recover session, worktree, and branch
state; create continuation briefs; connect requests to outcomes; detect repeated
failure patterns; ask for missing information; and turn only approved lessons
into memory or instruction proposals.

Prompt capture and scoring are supporting evidence mechanisms. They are not the
product identity and must not turn an unclear request into an automatic rewrite.

## Review Rules

1. New public identifiers must use only the canonical identity above.
2. Hooks remain fail-open and never expose raw prompts or private paths.
3. No automatic provider calls, prompt resubmission, memory writes, or
   instruction-file writes are allowed.
4. Repository, package, plugin, MCP, hook, documentation, and stored-data
   surfaces must move together when this contract changes.
