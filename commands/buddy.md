---
description: Show the LoopRelay side-pane buddy command
---

# LoopRelay Buddy

Use this when the user wants an always-on prompt score companion while working
inside Claude Code.

Claude Code cannot open a persistent right-side plugin panel from this command.
Instead, instruct the user to open a second terminal pane beside Claude Code and
run:

```sh
looprelay buddy
```

For a one-shot check inside this conversation, run:

```sh
looprelay buddy --once
```

For machine-readable output, run:

```sh
looprelay buddy --json
```

Also mention the optional Claude Code status line if they want a compact HUD:

```sh
looprelay install-statusline claude-code
looprelay statusline claude-code
```

If another Claude Code HUD already exists, explain that looprelay chains
the existing command and restores it on uninstall where possible.

Do not print raw prompt bodies, raw hook payloads, raw absolute paths, tokens,
or secrets. Explain that the buddy is local-only, reads the looprelay
archive, and never auto-submits improved prompts.
