# Agent-native validation protocol

LoopRelay is an agent-facing local continuity tool. This protocol validates
agent operation without inventing unavailable human participants.

Human usability is a separate, optional research question. It is not a public
release gate in this protocol and no agent result may be described as a human
result.

## Required evidence

The agent-native gate requires all of the following, as raw-free records:

1. A checksum-pinned candidate passes clean install and first continuity value
   in an isolated HOME, npm prefix, and fresh Git repository.
2. Three fresh, non-resumed Codex or Claude Code sessions successfully call the
   installed LoopRelay MCP surface, across at least two client families.
3. At least one of those sessions receives a continuation brief.
4. No privacy, data-loss, or installation blocker is observed.

The clean package installation and agent MCP invocation are intentionally
separate. Coding-agent sandboxes may prohibit an agent from installing npm
packages itself; that is onboarding friction, not evidence that the package
installer failed. Retain such failures with a safe reason code and never turn
them into successful first-value results.

## Record boundaries

Store only client family/version, fresh-session flag, safe candidate hashes,
boolean MCP/brief outcomes, elapsed values when measured, counts, and blocker
flags. Do not store prompts, agent outputs, paths, transcripts, credentials, or
hidden reasoning.

The generated report must keep three things separate:

- matched-pair outcome evidence;
- agent-native release readiness;
- unmeasured human usability.

`causal_claim` remains false. Passing this gate proves a bounded release
readiness condition for supported coding agents, not general productivity or
human adoption.
