# Loopdeck Legacy Surfaces

Last updated: 2026-07-05

Product name: PromptLane.

Default runtime command: `prompt-coach`.

Legacy CLI alias: `loopdeck`.

This document is the allowlist for remaining Loopdeck and `loopdeck` strings.
Any new product-facing copy should use PromptLane. Any new runtime command,
plugin command, MCP server name, data directory, or hook command should use the
existing `prompt-coach` compatibility identity unless a dedicated migration plan
changes that contract.

## Allowed Surfaces

### Legacy CLI Alias

`package.json#bin.loopdeck` may point at the same compiled CLI entrypoint as
`prompt-coach`. README and package contents may mention it only as a legacy
compatibility alias for earlier manual terminal workflows.

Do not present `loopdeck` as the recommended command for new users.

### MCP Compatibility Tool

MCP compatibility tool: `get_loopdeck_status`.

This tool name may remain because connected MCP clients, docs, tests, and
existing agent prompts can depend on the published tool name. Tool descriptions
and result copy should say PromptLane when they describe the product.

### Internal Runtime Types

Internal names such as `LoopdeckStatus`, `createLoopdeckStatus`, and related
tests may remain while they describe the existing loop status model. New
user-facing copy should not reuse those internal names as product branding.

### Historical Planning Docs

Historical planning docs under `docs/superpowers/plans/2026-07-04-loopdeck-*`
and older sections in `docs/superpowers/specs/2026-07-04-agent-loop-memory-design.md`
may keep Loopdeck wording when the document is preserving past decisions,
rejected plans, or migration history.

When historical docs are shipped, they must point readers to `docs/PROMPTLANE.md`
or `docs/LOOPDECK.md` for the current product identity.

## Forbidden Surfaces

- Do not use Loopdeck as product-facing copy.
- Do not add `/loopdeck:*` command files.
- Do not rename the package, primary CLI, hook command, MCP server name, data
  directory, or slash namespace from `prompt-coach` without a dedicated
  migration plan and release gate.
- Do not make `loopdeck` the default command in README, plugin metadata, command
  docs, or Codex default prompts.

## Review Rule

When a new `Loopdeck` or `loopdeck` string appears, classify it as one of:

1. legacy CLI alias
2. MCP compatibility tool
3. internal runtime type or test
4. historical planning doc
5. forbidden product-facing copy

Only the first four are allowed.
