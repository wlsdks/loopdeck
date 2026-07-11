---
description: Set up LoopRelay capture or the one-command coach profile
allowed-tools: Bash, Read, AskUserQuestion
---

# Set Up LoopRelay

First check that the CLI is installed:

```bash
command -v looprelay
```

If this returns nothing, stop and tell the user to install the CLI first. After
the npm package is published, the normal install path is:

```bash
npm install -g looprelay
```

Before npm publish, or for local development, use a cloned repository:

```bash
git clone https://github.com/wlsdks/looprelay.git
cd looprelay
pnpm install   # also runs `pnpm build` via the prepare lifecycle
pnpm setup     # alias for looprelay setup --profile coach --register-mcp --open-web
```

`pnpm setup` is the same one-command path the README recommends — it
installs the Claude Code and Codex hooks, registers the MCP server with
absolute paths so PATH ordering does not matter, installs the Claude
Code status line, and enables the local-server SessionStart hook. For Codex,
this is the preferred path because it avoids relying on a global
`looprelay` binary in PATH. Use `pnpm setup` when the user just wants
"make it work"; only fall back to the explicit `looprelay setup ...`
invocations below when the user wants a different profile or a dry-run preview.
Claude Code slash commands use the single `/looprelay:*` namespace.

For the lowest-friction setup with the explicit invocation, preview the
coach profile first:

```bash
looprelay setup --profile coach --register-mcp --dry-run
```

Explain the planned changes to the user. The setup may initialize
`~/.looprelay`, add Claude Code or Codex hooks, and install a local server
service where supported. The coach profile also installs low-friction rewrite
guidance and the Claude Code status line when Claude Code is detected. If an
existing Claude Code status line is already configured, looprelay chains it
instead of replacing it and restores it on uninstall where possible. With
`--register-mcp`, it also runs the detected `claude mcp add` or `codex mcp add`
command so this active agent can use looprelay tools.

If the user wants the web workspace to open beside Claude Code or Codex at
agent startup, explain that this is opt-in and preview:

```bash
looprelay setup --profile coach --register-mcp --open-web --dry-run
```

If the user approves, run:

```bash
looprelay setup --profile coach --register-mcp
```

If the user approved automatic web opening, include `--open-web` in the real
setup command. The hook opens the browser once per agent session id and fails
open without printing prompts, paths, or tokens.

After setup, keep the first success path short:

```bash
# ask the user to send one Codex or Claude Code coding prompt, then:
looprelay coach
```

Use `doctor` only if the prompt does not appear:

```bash
looprelay doctor claude-code
looprelay doctor codex
```

If MCP registration fails or the user chooses not to use `--register-mcp`,
first recommend rerunning the setup command. Provide manual commands only for a
published/global install where `command -v looprelay` succeeds:

```bash
claude mcp add --transport stdio looprelay -- looprelay mcp
codex mcp add looprelay -- looprelay mcp
```

Use the default capture-only profile only when the user wants passive recording
without prompt coaching:

```bash
looprelay setup
```

Verify the result:

```bash
looprelay statusline claude-code
```

Tell the user to restart Claude Code if the new status line does not appear.
