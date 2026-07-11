# LoopRelay Plugin Rename Plan

Historical naming note:

- Current product name: LoopRelay.
- Current runtime id: `looprelay`.
- This document preserves an older LoopRelay compatibility decision. See `docs/LOOPRELAY.md` for the active product contract.
- See `docs/LOOPRELAY-RUNTIME-SURFACES.md` before adding or changing any LoopRelay/`looprelay` surface.

**Date:** 2026-07-04
**Status:** Compatibility gate, not an implementation approval

## Decision

LoopRelay is the product name, but the current package name remains `looprelay`, the current primary CLI remains `looprelay`, and `looprelay` is a compatibility-preserving CLI alias.

Claude Code slash commands remain `/looprelay:*` until this plan's gates are
met. Do not ship `/looprelay:*` as the only namespace, do not remove existing
`/looprelay:*` commands, and do not rename the plugin id in the same slice as
ordinary product copy changes.

## Why This Needs A Separate Plan

Plugin identifiers and slash command namespaces are runtime contracts. They are
not just brand copy. Claude Code users may have command muscle memory, saved
docs, marketplace install state, and team onboarding snippets that reference
`/looprelay:*`. Codex users may have the repo-local plugin installed from
`plugins/looprelay` and hooks that execute the `looprelay` binary.

A direct rename would risk breaking the exact agent surfaces LoopRelay needs to
be trusted by: setup, capture hooks, MCP registration, status checks, and local
review workflows.

## Current Compatibility Contract

- `package.json#name` stays `looprelay`.
- `package.json#bin.looprelay` stays the primary compatibility command.
- `package.json#bin.looprelay` stays an alias to the same compiled CLI entrypoint.
- `.claude-plugin/plugin.json#name` stays `looprelay`.
- Claude Code command docs stay under `commands/*.md` and remain installed as
  `/looprelay:*`.
- `plugins/looprelay/.codex-plugin/plugin.json#name` stays `looprelay`.
- Codex hooks keep calling `looprelay hook codex` unless a later compatibility
  slice proves a dual command path.
- Claude Code hooks keep calling `looprelay hook claude-code` unless a later
  compatibility slice proves a dual command path.
- MCP examples keep the server name `looprelay` during this migration.

## Rename Phases

### Phase 1: Observe compatibility

Keep the current ids stable and collect evidence that the LoopRelay product name
is understandable without changing runtime ids. This phase is the current state.

Required evidence:

- README and plugin docs explain the product name and the `looprelay` runtime
  ids.
- `looprelay` manual CLI alias works while `looprelay` remains primary.
- Packaging tests lock package, plugin, command, hook, and docs compatibility.
- Fresh install smoke proves `looprelay setup --profile coach --register-mcp`
  still works from the published package shape.

### Phase 2: Add dual namespace aliases

Add `/looprelay:*` only as aliases, not replacements. Every new LoopRelay slash
command must route to the same local CLI or MCP workflow as its
`/looprelay:*` equivalent.

Required evidence:

- Both `/looprelay:setup` and `/looprelay:setup` are documented.
- Both old and new command docs install from the Claude Code marketplace.
- Codex plugin metadata can advertise LoopRelay while keeping
  `plugins/looprelay` install compatibility.
- Hook commands still work when only `looprelay` is on `PATH`.
- Hook commands also work when only the `looprelay` alias is on `PATH`, if that
  behavior is explicitly implemented.

### Phase 3: Deprecate old namespace

Only after Phase 2 has real usage evidence, mark `/looprelay:*` as
deprecated in docs while keeping it functional.

Required evidence:

- Release notes announce the deprecation window.
- README.md, docs/PLUGINS.md, `.claude-plugin/plugin.json`,
  `plugins/looprelay/.codex-plugin/plugin.json`, and `commands/*.md` are
  updated together.
- CI verifies both namespaces still work.
- Support docs explain how to migrate saved slash command snippets.

### Phase 4: Remove only after a major/versioned window

Remove old ids only after a major release or clearly versioned compatibility
window. This must be a breaking-change release with explicit rollback guidance.

Required evidence:

- No supported install path still depends on `/looprelay:*`.
- Fresh install smoke passes for the new namespace.
- Upgrade smoke passes from a version that still used `/looprelay:*`.
- Docs have no stale old-namespace examples except in migration notes.

## Acceptance Gates Before Any Runtime Rename

- `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, and
  `git diff --check` pass.
- Packaging tests cover `package.json`, `.claude-plugin/plugin.json`,
  `plugins/looprelay/.codex-plugin/plugin.json`, `commands/*.md`,
  `README.md`, and `docs/PLUGINS.md`.
- fresh install smoke proves the package installs the expected binaries and
  plugin files.
- Codex plugin smoke proves the repo-local plugin loads, the fail-open prompt
  hook runs, and no secret or prompt body is printed.
- Claude Code plugin smoke proves marketplace install, slash command discovery,
  and setup/status commands work.
- Hook compatibility is checked for every hook marker that currently references
  `looprelay`.
- MCP server name compatibility is checked before any server-name rename.
- Release notes state whether this is alias-only, deprecated, or breaking.

## Files That Must Move Together

- `package.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `plugins/looprelay/.codex-plugin/plugin.json`
- `plugins/looprelay/skills/looprelay/SKILL.md`
- `commands/*.md`
- `README.md`
- `README.ko.md`
- `docs/PLUGINS.md`
- `docs/PACKAGE_CONTENTS.md`
- packaging tests in `src/packaging/plugin-files.test.ts`

## Explicit Non-Goals For The Current Slice

- No `/looprelay:*` slash commands.
- No npm package rename.
- No removal of the `looprelay` binary.
- No plugin id rename.
- No hook marker rename.
- No MCP server name rename.
- No hidden external LLM or hosted migration service.

## First Implementable Slice After This Plan

If rename work becomes urgent, start with a pure docs/test slice that adds
alias-only command docs while keeping every `/looprelay:*` command intact.
Only then add implementation for dual namespace aliases, and only after a RED
test proves both old and new namespaces are packaged.
