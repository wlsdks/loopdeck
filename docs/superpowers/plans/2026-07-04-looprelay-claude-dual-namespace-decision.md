# LoopRelay Claude Code Dual Namespace Decision

Historical naming note:

- Current product name: LoopRelay.
- Current runtime id: `looprelay`.
- This document preserves an older LoopRelay compatibility decision. See `docs/LOOPRELAY.md` for the active product contract.
- See `docs/LOOPRELAY-RUNTIME-SURFACES.md` before adding or changing any LoopRelay/`looprelay` surface.

**Date:** 2026-07-04
**Slice:** R3 Claude Code Dual Namespace Packaging
**Decision: defer**

## Context

R2 documented `/looprelay:*` as a future alias-only slash namespace while keeping
`/looprelay:*` available. R3 asked whether Claude Code can package both
namespaces now.

The current Claude Code plugin reference describes commands as plugin
components loaded from `commands/` or `skills/`, and the plugin manifest
`name` is the component namespace. The relevant reference is:

- https://code.claude.com/docs/en/plugins-reference

Claude Code plugin `name` is the namespace for packaged commands in the current
plugin model.

This means adding files such as `commands/looprelay-setup.md` under the current
`looprelay` plugin would not create `/looprelay:setup`. It would create another
command inside the existing plugin namespace instead, so it would not create
`/looprelay:*` and would make the migration harder to reason about.
In short, this would not create `/looprelay:*`.
The same problem applies to a `commands/looprelay-*.md` pattern.

## Decision

Do not add `/looprelay:*` command files yet.

`/looprelay:* remains required` for Claude Code plugin users. The package,
Claude Code plugin name, Codex plugin id, hook commands, and MCP server-name
examples stay on the current compatibility ids.

## Safe Future Paths

R3 can reopen only if one of these paths is chosen and proven with a fresh
failing test first:

- dual plugin package: ship a second Claude Code plugin identity named
  `looprelay` that aliases the same workflows while keeping `looprelay`
  installed and discoverable
- official namespace alias support: use a documented Claude Code mechanism that
  maps one plugin's commands into an additional namespace without changing the
  compatibility plugin id
- major rename window: rename the plugin id only after deprecation, rollback,
  marketplace, and saved-command migration gates are satisfied

## Acceptance Gate For Any Reopen

- keep `/looprelay:*` installed and documented
- prove `/looprelay:*` discovery with a Claude Code plugin smoke, not just file
  presence
- keep hook-sensitive command paths on `looprelay` unless a hook binary smoke
  proves a dual command path
- do not store or print prompt bodies, transcript text, compact summaries, raw
  paths, API tokens, or provider credentials
- update README, README.ko, docs/PLUGINS, package contents, and release notes
  in the same slice
