# LoopRelay Feature Inventory Audit

Date: 2026-07-12  
Reviewed state: `ab0fdf09` plus the feature-inventory working-tree change  
Canonical inventory: [FEATURE_INVENTORY.md](FEATURE_INVENTORY.md)

## Verdict

The current inventory now covers every implementation surface that can be
enumerated directly from the source tree. No critical correctness, privacy,
data-loss, or packaging blocker was found in this review.

Fresh read-only doctor commands in the current configured environment returned
`ready` with exit code 0 for both Codex and Claude Code. This is recorded
separately from the isolated setup smoke so the two kinds of evidence are not
conflated.

The audit did find documentation omissions and maintainability debt:

- 16 static server routes were not initially separated from the 37 product API
  routes;
- installed slash commands, logical SQLite tables, web view identities, npm
  scripts, and binary names were described by category but not enumerated;
- the first drift guard covered only CLI and MCP surfaces;
- three central modules remain much larger than the repository's preferred
  maintainability threshold.

The inventory and its automated guard were expanded in this change. The large
modules are recorded as follow-up debt, not silently treated as complete.

## Audit scope

This review covered:

- 223 production TypeScript/TSX files;
- 154 TypeScript/TSX test files, including the new inventory guard;
- 28 maintainer `.mjs` scripts;
- 10 installed slash-command Markdown files;
- CLI registration and help structure;
- MCP tool registration;
- local HTTP API and static route registration;
- client-side view routing and primary navigation;
- Claude Code and Codex hook lifecycle integration;
- initialized SQLite schema and local filesystem boundaries;
- npm binaries, package scripts, and published-file inclusion;
- privacy, authentication, CSRF, redaction, and source-hygiene tests;
- dormant and reserved behavior defined by ADRs;
- current effectiveness-evidence limitations.

## Method

1. Enumerate structural surfaces from their registration sources.
2. Compare every enumerated name with the canonical inventory.
3. Initialize a clean temporary LoopRelay data directory and inspect the real
   SQLite schema instead of relying only on migration text.
4. Inspect hook installers, example settings, runtime wrappers, and tests for
   lifecycle coverage.
5. Inspect authentication and mutation-route CSRF enforcement.
6. Search tracked source for retired product names, unfinished markers,
   suppressed type checks, broad `any`, and debug output.
7. Run a heuristic TypeScript quality scan, then manually classify its highest
   severity results to remove fixture-related false positives.
8. Run the complete unit/integration suite, formatting, both TypeScript
   compilers, the repository quality gate, and the production build.
9. Run an npm dry-run inspection and confirm the canonical inventory ships.

The public-release gate was intentionally not executed. Repository policy keeps
that aggregate gate for the final publication boundary; this audit ran its
directly relevant tests and build checks.

## Enumerated surface results

| Surface | Source of truth | Count | Inventory status | Drift guard |
| --- | --- | ---: | --- | --- |
| CLI command paths | Commander tree from `createProgram()` | 68 | Complete | Yes |
| MCP tools | `LOOPRELAY_MCP_TOOL_REGISTRY` | 24 | Complete | Yes |
| Product HTTP API routes | `src/server/routes/*.ts` | 37 | Complete | Yes |
| Static SPA/asset routes | `src/server/routes/static.ts` | 16 | Complete | Yes |
| Client-side view identities | `src/web/src/routing.ts` | 11 | Complete | Yes |
| Installed slash commands | `commands/*.md` | 10 | Complete | Yes |
| Logical SQLite tables | Fresh initialized database | 29 | Complete | Yes |
| npm maintainer scripts | `package.json#scripts` | 40 | Complete | Yes |
| Published binaries | `package.json#bin` | 3 | Complete | Yes |
| Hook lifecycle names | Hook installers and examples | 5 | Complete | Source tests |

The 53 HTTP registrations are intentionally split into 37 product API routes
and 16 static delivery routes. Static compatibility entries such as
`/practice`, `/benchmark`, `/insights`, `/import`, and `/prompts` serve the SPA
and currently fall through to the archive view; they are not counted as active
standalone workspaces.

The 29-table count includes the logical `prompt_fts` virtual table but excludes
SQLite's five generated `prompt_fts_*` support tables.

## Hook and client-integration verification

| Event/surface | Claude Code | Codex | Product behavior |
| --- | --- | --- | --- |
| `UserPromptSubmit` | Supported | Supported | Redacted prompt ingest and optional rewrite guidance |
| `SessionStart` | Supported | Supported by installer when enabled | Local status/opening handoff, no transcript scrape |
| `Stop` | Supported | Supported | Local loop-snapshot collection |
| `PreCompact` | Supported | Supported | Raw-free compact-boundary metadata |
| `PostCompact` | Supported | Supported | Raw-free compact-boundary metadata |
| MCP registration | Supported | Supported | Local stdio server with 24 tools |
| Status surface | Status line | HUD/wrapper where supported | Local health and next action |

Hook failure remains fail-open: a LoopRelay delivery failure must not block the
primary coding-agent session or echo a raw prompt into failure output.

## Storage and privacy verification

Verified implementation boundaries:

- default masking happens before prompt persistence;
- prompt Markdown, SQLite rows, FTS content, browser responses, import/export
  job surfaces, loop outcomes, memories, instruction patches, compact
  boundaries, and agent runs have raw-path/secret regression coverage;
- project IDs are opaque and project labels are browser-safe;
- sensitive local files and directories use owner-only permissions;
- ingest uses a separate bearer token;
- application reads require the local application session or bearer token;
- state-changing browser routes require CSRF validation;
- hard deletion removes related database, Markdown, and index state;
- index rebuild validates persisted content before reindexing;
- quarantine and spool directories are reserved and empty, not hidden active
  recovery systems;
- retention and external-analysis policy fields do not autonomously delete or
  transmit data.

## Finding register

### Resolved in this audit

#### F-01 — HTTP route inventory was incomplete

Severity: medium documentation risk  
Resolution: all 37 API routes and 16 static routes are now listed. The earlier
method mismatch for loop brief/instruction-patch was corrected to `GET`.

#### F-02 — Exact auxiliary surface names were missing

Severity: medium drift risk  
Resolution: added all 10 slash commands, 11 web views, 29 logical tables, 40 npm
scripts, and 3 binaries.

#### F-03 — Inventory drift protection covered only CLI and MCP

Severity: medium maintenance risk  
Resolution: the inventory test now derives and checks HTTP routes, web views,
slash commands, a freshly initialized schema, npm scripts, binaries, CLI, MCP,
and package inclusion.

#### F-04 — The May feature audit could be mistaken for current evidence

Severity: medium release-claim risk  
Resolution: the old audit is explicitly labeled historical and points to the
canonical inventory.

### Open, non-blocking findings

#### O-01 — Central modules remain oversized

Severity: medium maintainability risk  
Status: open

The heuristic scan identified these primary aggregation points:

| File | Approximate lines | Risk |
| --- | ---: | --- |
| `src/web/src/api.ts` | 4,419 | API parsing and transport responsibilities are concentrated |
| `src/web/src/App.tsx` | 2,534 | Application orchestration remains broad despite extracted views |
| `src/storage/sqlite.ts` | 2,990 | Many storage capabilities share one adapter implementation |
| `src/cli/commands/loop.ts` | 788 | Numerous loop workflows share one command module |
| `src/server/routes/loops.ts` | 674 | Read, brief, outcome, memory, and patch routes are colocated |

No failure was observed in the complete suite, type checks, quality gate, or
build. Refactoring should be incremental and contract-preserving, not a large
pre-launch rewrite. Recommended seams are web API domains, application
orchestration hooks, SQLite capability adapters, and loop route groups.

#### O-02 — Compatibility SPA paths are implicit

Severity: low product-clarity risk  
Status: open

`/practice`, `/benchmark`, `/insights`, `/import`, and `/prompts` are tested as
valid SPA entrypoints but resolve to the archive fallback rather than a named
current view. Preserve them only as deliberate compatibility aliases; a future
cleanup should either redirect explicitly or remove them with release notes.

#### O-03 — Human usability remains unmeasured

Severity: product-evidence limitation  
Status: open

Agent-operated and maintainer-run matched pairs validate mechanisms and provide
directional usefulness evidence. They do not prove independent-human usability
or causality. This limitation remains visible in the inventory and README.

#### O-04 — Route drift extraction assumes literal registration

Severity: low test-maintenance risk  
Status: accepted

The drift test extracts literal `server.get/post/...` and
`fastify.get/post/...` calls. If route registration moves to generated objects
or helper functions, the extractor must change in the same commit.

## Automated-review classification

The code-review heuristic analyzed 377 TypeScript files and returned an average
score of 93.1/A. Its raw 1,513 smell count is not treated as 1,513 actionable
defects: most are fixture dates, expected HTTP numbers, and long test cases.

Highest-severity automatic findings were manually classified:

- five `hardcoded secret` reports were synthetic `test-secret` values and
  secret-shaped redaction/rejection fixtures; no real credential was found;
- two `console.log` reports in `guide.ts` are intended CLI stdout actions, not
  debug statements;
- tracked source contains no `@ts-ignore`, `eslint-disable`, or broad `any`
  match under the audit query;
- tracked source contains no active TODO/FIXME marker; matches are negative
  assertions that prevent unfinished documentation;
- tracked files contain zero `promptlane`, `prompt-memory`, or `prompt-coach`
  matches.

## Verification record

| Command/check | Result |
| --- | --- |
| Inventory focused test | 1 file, 8 tests passed |
| Full `pnpm test` | 154 files, 1,333 tests passed |
| `pnpm lint:format` | Passed |
| server and web TypeScript checks | Passed |
| repository quality gate | Passed |
| production server/web build | Passed |
| `git diff --check` | Passed |
| npm package dry-run inventory inclusion | Passed; 415 files, both inventory documents included |
| isolated agent setup and doctor smoke | Passed |
| Claude Code and Codex hook-binary fail-open smoke | Passed |
| MCP coach-loop smoke | Passed |
| browser end-to-end flow | Passed |
| live `doctor codex --json` | `ready`, exit 0 |
| live `doctor claude-code --json` | `ready`, exit 0 |
| retired-name tracked-source search | 0 matches |
| critical privacy/data-loss blocker | 0 found |

## Release interpretation

This audit establishes implementation/documentation coverage for the reviewed
working tree and includes fresh live doctor readiness for the currently
configured Codex and Claude Code environments. It is not the final
public-release gate, npm authentication/publication evidence, a clean-machine
install result for this exact working tree, or an independent-user study. Those
must remain separate so a green source audit cannot be mistaken for complete
launch readiness.

## Maintenance rule

- Update the canonical inventory and its test in the same change as any new or
  renamed registered surface.
- Append a new dated audit instead of rewriting this evidence snapshot.
- Keep active, opt-in, validation, dormant, reserved, and absent behavior
  visibly separate.
- Record negative results and open debt; do not turn an implementation count
  into a usefulness or causal claim.
