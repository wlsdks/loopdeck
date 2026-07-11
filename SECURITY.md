# Security Policy

## Supported Versions

LoopRelay 1.0.0 is the current stable release line. Security fixes are applied
to `main` first, then released as patch versions when a fix affects published
users.

## Reporting A Vulnerability

Please report suspected vulnerabilities through a private channel rather than a public issue when the report includes exploit details or sensitive data.

If private vulnerability reporting is not available for this repository, contact the maintainer directly and include:

- affected version or commit
- operating system
- reproduction steps
- expected impact
- whether prompt text, tokens, or local files were exposed

Do not include real API keys, OAuth tokens, session tokens, private prompts, or proprietary code in the report.

## Data Handling Boundaries

`looprelay` is local-first:

- Ingest binds to the configured local server, defaulting to `127.0.0.1:17373`.
- Hook ingest requires a local bearer token.
- The web UI uses a same-origin session cookie and CSRF token.
- `looprelay` does not make hidden external LLM calls. Agent rewrite/judge
  MCP tools may return redacted prompt packets to the active user-controlled
  Claude Code, Codex, or Gemini CLI session when explicitly called, and that
  agent may send the packet through its provider session according to the
  user's tool setup.
- Prompt text is redacted before Markdown, SQLite, and FTS storage in `mask` mode.

`looprelay` must not extract, store, proxy, sell, or reuse upstream account credentials such as Claude.ai OAuth tokens, Claude Code internal auth tokens, OpenAI/Codex session tokens, or ChatGPT account tokens.

## Known Limits

- Redaction is best-effort.
- Local users and local backup/snapshot systems may still access files in the configured data directory.
- Deleting looprelay records does not delete copies retained by upstream tools, terminals, shells, editors, filesystem snapshots, or external backups.
- Windows ACL hardening requires separate release validation.
