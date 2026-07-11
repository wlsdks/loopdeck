# LoopRelay MCP Server Name Decision

Historical naming note:

- Current product name: LoopRelay.
- Current runtime id: `looprelay`.
- This document preserves an older LoopRelay compatibility decision. See `docs/LOOPRELAY.md` for the active product contract.
- See `docs/LOOPRELAY-RUNTIME-SURFACES.md` before adding or changing any LoopRelay/`looprelay` surface.

**Date:** 2026-07-04
**Slice:** R6 MCP Server Name Compatibility Decision
**Decision: keep `looprelay` canonical**

## Context

The product-facing name is LoopRelay, and the package already ships a `looprelay`
CLI alias. MCP server names are different from CLI aliases: users and agents can
save tool references, snippets, and setup state under the configured MCP server
name.

Current official references still use explicit user-chosen server names:

- OpenAI Codex MCP: `codex mcp add <server-name> -- <stdio server-command>`
  https://developers.openai.com/codex/mcp
- Claude Code MCP: `claude mcp add [options] <name> -- <command> [args...]`
  https://docs.anthropic.com/en/docs/claude-code/mcp

Because the server name is user-visible and persisted in agent configuration,
renaming it is a runtime compatibility change, not brand copy.

## Decision

Keep `looprelay` as the canonical MCP server name during the LoopRelay
compatibility window.

Do not add `looprelay` MCP server-name examples yet. Documentation and setup
output should continue to use:

```sh
claude mcp add --transport stdio looprelay -- looprelay mcp
codex mcp add looprelay -- looprelay mcp
```

The `looprelay mcp` CLI alias may work as a command path because `looprelay` points
to the same binary, but that is not enough to create safe server-name alias
behavior. If a future slice adds a `looprelay` MCP server-name example, it must
explain whether users should run both server names, migrate one to the other, or
keep `looprelay` as the stable id.

## Reopen Conditions

Only reopen a `looprelay` MCP server-name alias if a fresh RED/GREEN slice proves:

- setup and doctor output explain canonical name versus alias behavior
- Claude Code and Codex registration examples remain backward compatible
- MCP tool calls still work for existing `looprelay:*` tool references
- rollback instructions remove or ignore the alias without breaking the
  canonical registration
- docs avoid implying hidden hosted services, provider credential proxying, or
  external LLM calls

## Non-Goals

- no MCP server-name rename
- no `mcp add looprelay` examples
- no hidden external service
- no provider credential storage or proxy
- no prompt body, transcript, compact summary, raw path, API token, or provider
  credential output
