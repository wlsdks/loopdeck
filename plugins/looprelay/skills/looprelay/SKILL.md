---
name: looprelay
description: Use when the user wants to install, verify, search, or troubleshoot LoopRelay, the local coding-agent continuity and evidence layer for Codex or Claude Code.
---

# LoopRelay

Use this skill when the user wants Codex to work with LoopRelay through the local
CLI/archive. The single public CLI command is `looprelay`.

## What This Plugin Does

LoopRelay stores coding-agent prompts and loop metadata locally. It redacts
sensitive values before writing Markdown files, indexes the archive in SQLite,
and exposes a local web UI at `http://127.0.0.1:17373`.

The plugin does not install active hooks by itself. Run the coach profile from
the installed package so LoopRelay writes one explicit user-level hook
configuration:

```sh
looprelay start
looprelay setup --profile coach --register-mcp --open-web
```

If `looprelay` is not available yet because the npm package has not been
published, use a local checkout first:

```sh
git clone https://github.com/wlsdks/looprelay.git
cd looprelay
pnpm install
pnpm setup
```

The coach profile installs capture hooks, low-friction rewrite guidance, local
server startup where supported, and the Claude Code status line when Claude Code
is detected. `--register-mcp` also registers the MCP server with detected Claude
Code/Codex CLIs so the active agent can call coach/rewrite/judge tools. Use
plain `looprelay setup` only when the user wants passive capture without
coaching.

Setup-installed hooks use `UserPromptSubmit` for prompt capture/rewrite guidance,
`Stop` for local LoopRelay snapshot collection, and `PreCompact`/`PostCompact`
for compact boundary metadata. Stop snapshots and compact boundaries are
metadata-only: prompt ids, safe project labels, quality gaps, trigger values,
and optional HMAC content hashes, not prompt bodies, raw paths, custom compact
instructions, compact summaries, or transcript contents.

After setup, ask the user to send one real coding prompt in Claude Code or
Codex, then run `looprelay coach`. Use `doctor` and manual MCP registration
only if capture or agent-native commands do not appear.

Toggle the `UserPromptSubmit` rewrite guard between four modes
(`off`, `context`, `ask`, `block-and-copy`) without remembering CLI flags:

```sh
looprelay hook status        # see the mode currently installed per tool
looprelay setup --rewrite-guard ask --no-service --skip-statusline
```

In `ask` mode, when a captured Codex prompt scores low and clears the
trigger gate (length ≥ 30, score < 60, not an acknowledgment), the
hook tells the active agent to call the looprelay
`ask_clarifying_questions` MCP tool with `allow_native_dialog: true`.
The MCP tool prefers `elicitation/create` and falls back to a native
OS dialog (osascript / zenity / PowerShell InputBox) when the host
CLI does not advertise elicitation support.

When working from this repository during development, build first and use the
repo script:

```sh
pnpm build
pnpm setup
```

`pnpm setup` registers MCP with absolute Node + `dist/cli/index.js` paths, which
is the safer Codex configuration for a cloned checkout.

## Common Checks

Check Codex capture:

```sh
looprelay doctor codex
```

Check Claude Code capture:

```sh
looprelay doctor claude-code
```

Open the web archive:

```sh
looprelay server
```

Then visit `http://127.0.0.1:17373`.

Run the local MCP score server when Codex needs to score a prompt on request:

```sh
looprelay mcp
```

## Agent-Native Workflows

Use these workflows before sending the user to the web UI:

- Always-on side pane: tell the user to open a second terminal pane and run
  `looprelay buddy`. Use `looprelay buddy --once` for a one-shot text
  snapshot or `looprelay buddy --json` for automation. This is the
  cross-agent alternative to a persistent right-side UI panel.
- Full coach workflow: call `looprelay:coach_prompt`. If MCP is
  unavailable, run `looprelay coach --json`. Use this as the default when
  the user asks to coach, evaluate, improve, or prepare the next request.
- Latest prompt score: call `looprelay:score_prompt` with `latest=true`.
  If MCP is unavailable, run `looprelay score --latest --json`.
- Latest prompt rewrite: call `looprelay:improve_prompt` with
  `latest=true, rewrite=true` only after the user explicitly requests a full
  rewrite. If MCP is unavailable, run
  `looprelay improve --latest --rewrite --json`.
- Agent-assisted latest prompt rewrite: call
  `looprelay:prepare_agent_rewrite` with `latest=true`, rewrite the returned
  redacted prompt in the active Codex/Claude Code session, ask for approval,
  then call `looprelay:record_agent_rewrite` only if the user wants the
  improved draft saved. Use this when the user wants semantic LLM help beyond
  the local deterministic rewrite.
- Habit review: call `looprelay:score_prompt_archive` with
  `max_prompts=200` and summarize recurring gaps, practice plan, and low-score
  ids.
- Real benchmark readiness: call `looprelay:get_benchmark_candidates` before
  asking the user to prepare a fixture. Explain the staged body-free status and
  use `looprelay benchmark prepare-fixture` only after the user reviews the
  returned ids and explicitly confirms local consent.
- Paired benchmark readiness: call
  `looprelay:get_paired_benchmark_candidates`, show the body-free baseline and
  LoopRelay groups, and ask the user to select genuinely comparable tasks
  before using `looprelay benchmark prepare-pair`. Never infer equivalence or
  claim causality from the candidate report.
- Project rules review: call `looprelay:review_project_instructions` with
  `latest=true` for AGENTS.md / CLAUDE.md quality checks.
- Next request template: use `score_prompt_archive` and turn
  `next_prompt_template` plus `practice_plan` into one approval-ready template.
- One-command setup: prefer
  `looprelay setup --profile coach --register-mcp --open-web` over asking
  the user to install hooks, rewrite guidance, status line, and MCP registration
  separately. Use `looprelay install-hook codex` only for focused manual
  repair when setup cannot be rerun. In a cloned checkout, prefer `pnpm setup`.
  For a new user, show
  `looprelay start` first so the happy path stays
  `setup -> one real prompt -> coach`.
- Initial prompt wrapper: when the user wants one-click rewrite before launching
  a new agent session, suggest `lr-claude --lr-mode auto -- "..."` or
  `lr-codex --lr-mode auto -- "..."`. Use `--lr-dry-run` first when verifying.
  Be clear that wrappers rewrite only the initial prompt argument, not every
  later interactive message.

Open the web UI only when the user wants the dashboard, archive browsing,
project policy controls, export, or a visual review of trends.

The MCP tools are:

- `get_looprelay_status` for local setup, capture readiness, and next calls
- `coach_prompt` for the default one-call Claude Code/Codex prompt coach
  workflow
- `score_prompt` for one current, pasted, stored, or latest prompt
- `improve_prompt` for diagnosis by default, or an approval-ready draft when
  the user explicitly requests `rewrite=true`
- `prepare_agent_rewrite` for a redacted one-prompt packet the current agent
  session can semantically rewrite
- `record_agent_rewrite` for saving that agent-produced rewrite as a redacted
  improvement draft after user approval
- `score_prompt_archive` for accumulated prompt habit review across the local
  archive, including a practice plan and next prompt template
- `review_project_instructions` for AGENTS.md / CLAUDE.md rule quality review
- `get_benchmark_candidates` for body-free real-effectiveness readiness and
  safe candidate ids before consent-bearing fixture preparation
- `get_paired_benchmark_candidates` for body-free baseline/treatment selection
  before operator-reviewed paired fixture preparation
- `prepare_agent_judge_batch` for a bounded redacted packet the current agent
  session can judge
- `record_agent_judgments` for saving advisory agent judgment metadata

Use `score_prompt_archive` when the user asks to score all recent prompts, find
low scoring prompts, or summarize recurring prompt quality gaps. If MCP is not
configured, fall back to:

```sh
looprelay score --json
```

MCP tools return local structured metadata with declared output schemas without
storing direct prompt text or calling external LLMs. Archive-backed tools do not
return prompt bodies or raw paths.

When the user asks to review the prompt they just typed, call `score_prompt`
with `latest=true` if hook capture is enabled. If they paste a prompt explicitly,
call `score_prompt` with `prompt` instead.

When the user asks to rewrite, clarify, or upgrade the request before
resubmission, call `improve_prompt`. The returned draft is copy-based and
requires user approval; do not auto-submit it.

When the user explicitly asks you, the active agent, to improve the stored
prompt with LLM judgment, use `prepare_agent_rewrite` instead. Do not treat it
as automatic replacement: produce the improved draft, ask for approval, then
use `record_agent_rewrite` only to save the draft metadata and redacted draft.

If Prompt Rewrite Guard is installed with `--rewrite-guard block-and-copy`,
low-score submitted prompts may be blocked before processing and an improved
draft may be copied for the user to paste manually. Treat that as a
human-in-the-loop flow, not automatic replacement or auto-submit.

## Safety Rules

- Do not print raw prompt bodies or raw hook payloads unless the user explicitly
  asks for them.
- Prefer `doctor`, `list`, `search`, and `show <id>` over reading SQLite or
  Markdown internals directly.
- If a hook fails, keep the agent workflow unblocked and report the setup issue.
- Do not add hidden external LLM calls. Archive-backed analysis is local by
  default; agent-judge mode is allowed only through the explicit MCP packet and
  the active user-controlled agent session.
- Agent-assisted rewrite follows the same boundary: looprelay prepares a
  redacted packet and records a redacted draft, while the current user-controlled
  agent session performs the semantic rewrite.
