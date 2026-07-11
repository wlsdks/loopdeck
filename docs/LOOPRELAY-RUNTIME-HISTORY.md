# LoopRelay Legacy Decision

Last updated: 2026-07-05

LoopRelay is not the primary product name. It was rejected after review because
it made the product sound like a dedicated loop-engineering surface. The active
product name is LoopRelay.

LoopRelay remains only as historical terminology and a compatibility CLI alias
while the current npm package, primary CLI, hook command, Claude Code slash
namespace, and canonical MCP server name stay `looprelay`.

## Current Product Contract

Use `docs/LOOPRELAY.md` for current product identity, positioning, runtime
compatibility, privacy boundaries, and migration sequencing.

Use `docs/LOOPRELAY-RUNTIME-SURFACES.md` for the allowlist of remaining
LoopRelay/`looprelay` strings and the review rule for new occurrences.

## Legacy Runtime Notes

- `looprelay` may still appear as a CLI alias for existing manual terminal
  workflows.
- Existing loop snapshot/schema docs may still use LoopRelay wording until their
  own migration slices update them.
- `/looprelay:*` is not shipped as an active slash-command namespace.
- Do not re-promote LoopRelay in README, package metadata, plugin metadata, or
  new product-facing docs.

## Preserved Runtime IDs

These values are still compatibility IDs, not product names:

- npm package: `looprelay`
- primary CLI: `looprelay`
- hook command: `looprelay hook ...`
- canonical MCP server name: `looprelay`
- Claude Code slash namespace: `/looprelay:*`
- data directory: `~/.looprelay`
