# Live usability preregistration — 2026-07-12

This small, maintainer-run study checks present runtime usability. It is
observational and agent-native; it is not evidence of independent human
adoption or general productivity causality.

## Scope and boundaries

- Candidate: immutable local package made from commit `b7df1b5a`.
- Clients: fresh Codex CLI and Claude Code sessions, each with isolated npm,
  LoopRelay data, and a new Git repository.
- Product state: checkpoint summaries, continuation briefs, and outcomes are
  local-only and raw-free. Agent answers and tool-event traces stay outside the
  repository.
- Existing eleven real-task pairs remain the comparison set for failure,
  ambiguity, implementation, and release task types. This run does not pool a
  new task into that ledger without its full raw-free record and review.

## Preregistered checks

### 1. Client first value

For both clients, pass only when a fresh agent discovers the loop command,
creates an in-progress checkpoint, receives a continuation brief, and returns
the constrained completion object. Record installation and first-value time,
recovery/friction counts, and privacy/data-loss/install blockers. A harness
failure counts as evaluation friction but must not be attributed to the package
unless the installed CLI flow itself fails.

### 2. Current session-recovery matched pair

Run two fresh, read-only Codex sessions on the same current repository state.
Both receive the same generic resume request and may inspect repository files.
Only the treatment receives the exact local LoopRelay brief created from the
selected checkpoint. The selected checkpoint is not committed to Git.

Pass requires all of the following before proposing any code change:

1. identify that the immediate task is a usefulness evaluation, not a release;
2. preserve Codex and Claude first-value observations;
3. keep the two invalid Claude harness attempts as evaluation friction;
4. avoid treating agent-native results as independent-human adoption;
5. propose one evidence-based keep/narrow/remove decision.

Record elapsed time, tool calls, final-answer actionability, and each concept
as a boolean. Do not retain answer bodies or paths in the repository. A result
may be useful but still fail this strict rubric.

### 3. Decision rule

Retain the opt-in recovery path only if the treatment recovers more selected
state without a privacy or data-loss blocker. Keep first-value UX separate from
that comparison. Existing negative evidence continues to narrow generic
implementation and release context injection regardless of this outcome.

## Amendment before remediation pair

The first pair's checkpoint named the evaluation but did not contain the
client-observation values that the rubric asked a resumed agent to preserve.
That makes exact observation recovery unscorable rather than a product failure.
Retain the run as `checkpoint_evidence_under_specified`; do not pool it with
the real-task ledger.

Before either remediation condition runs, create a new local-only checkpoint
whose safe summary contains the two successful client-flow timings, their
friction counts, the count and cause class of the two invalid Claude harness
attempts, the no-human-adoption boundary, and the pending narrow scope decision.
Use the same repository commit, model, sandbox, generic resume request, output
shape, and strict five-concept rubric. The new baseline receives no checkpoint;
the new treatment receives only its generated brief. This tests recovery of
actually recorded state rather than inferred state.
