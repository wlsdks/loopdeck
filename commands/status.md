---
description: Check LoopRelay capture health
allowed-tools: Bash
---

# LoopRelay Status

First check that the CLI is installed:

```bash
command -v looprelay
```

If this returns nothing, report that the plugin is installed but the
`looprelay` CLI is not on `PATH` yet.

After the npm package is published, the normal install path is:

```bash
npm install -g looprelay
```

Before npm publish, or for local development, use a cloned repository:

```bash
git clone https://github.com/wlsdks/looprelay.git
cd looprelay
pnpm install
pnpm setup
```

Run the canonical `looprelay` commands:

```bash
looprelay doctor claude-code
looprelay statusline claude-code
```

If Codex is installed, also run:

```bash
looprelay doctor codex
looprelay doctor codex --json
```

Report whether the local server is reachable, the hook is installed, and the
MCP command access is registered. In JSON output, report top-level
`status: ready`, `status: unverified`, or `status: needs_attention` instead of
recomputing readiness from nested booleans. Treat `unverified` as a prompt to
send one new agent request and rerun doctor, not as a hard command failure.
`doctor` may use read-only `mcp list` fallbacks when config-file detection is
inconclusive. Do not print raw prompt bodies or raw hook payloads.
