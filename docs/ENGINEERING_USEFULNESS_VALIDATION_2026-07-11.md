# Engineering Usefulness Validation — 2026-07-11

This is maintainer-run observational evidence for LoopRelay's continuity and
evidence workflows. It is not a causal product claim.

## Method

Twelve matched pairs use fixed Codex model and reasoning settings, identical
fixture commits within each pair, a read-only boundary, one output schema, and
the same model context limit. Six pairs ran baseline first and six ran LoopRelay
first. The seed corpus covers session recovery (4), implementation continuation
(3), repeated-failure prevention (3), release-verification continuity (1), and
ambiguity clarification (1). It is below the active threshold of 30 total pairs
and five pairs per task type.

Human review used deterministic repository state and scored correct outcome,
context recovery, blocker identification, next-step actionability, and operator
friction. Prompt bodies and answer bodies are not committed. Invalid or
incomplete attempts do not count as pairs, but their product-caused friction is
retained in the raw-free ledger.

An independent Claude Code judge also compared anonymized final answers twice,
with A/B positions swapped. This judge did not receive the ground truth and is
therefore a bias diagnostic, not the source of success labels.

## Results

| Task type | Pairs | Baseline success | LoopRelay success | Difference |
| --- | ---: | ---: | ---: | ---: |
| Ambiguity clarification | 1 | 100% | 100% | 0pp |
| Failure prevention | 3 | 0% | 100% | +100pp |
| Implementation continuation | 3 | 100% | 66.7% | -33.3pp |
| Release-verification continuity | 1 | 100% | 100% | 0pp |
| Session recovery | 4 | 25% | 100% | +75pp |
| **Aggregate** | **12** | **50%** | **91.7%** | **+41.7pp** |

- Actionability increased from 66.7% to 90%.
- Mean elapsed time decreased by 0.83 seconds among runs with timing data.
- Mean tool calls increased from 3.67 to 3.92.
- Mean input tokens increased from 84,742 to 113,175 (+33.6%).
- Six failures improved, one successful baseline regressed, and three pairs
  remained successful.
- Human preference was LoopRelay 7, baseline 4, tie 1.
- Position-swapped judge choices were consistent for 9/10 pairs, but agreed
  with the ground-truth-based human preference on only 4/9 consistent pairs.
  This disagreement is evidence against using an ungrounded LLM preference as
  the usefulness label.

The two new Codex 0.144.1 / GPT-5.4 medium pairs used ephemeral sessions and
the same fixture commit in both conditions. Release continuity was a null
quality result: both conditions correctly blocked the gate. LoopRelay finished
in 48.46s versus baseline 51.00s, but used 12 versus 8 tool calls and 167,021
versus 118,105 input tokens. Ambiguity clarification was also a pass/pass pair,
but baseline was preferable: 21.15s versus 29.30s and 63,070 versus 91,539 input
tokens, while asking equally sufficient questions. This is evidence against
adding a generic LoopRelay diagnosis when repository instructions already say
which clarification dimensions are required.

Cached-token, TTFV, continuation-accuracy, and blocker flags are available for
the two new pairs only (16.7% condition coverage). The report exposes this
coverage instead of silently treating missing historical measurements as zero.

## Interpretation And Scope

The aggregate result is directional, not causal. The strongest signal is in
recovering session state and surfacing repeated-failure evidence. Ordinary
implementation continuation regressed, and the treatment consumed materially
more input tokens. LoopRelay therefore should stay opt-in and should not inject
a full continuation context into every coding task.

Keep current-project recovery, exact continuation briefs, and recurring-failure
evidence. Reduce default intervention for ordinary implementation work and
continue testing shorter briefs. Do not publish a claim of general coding-agent
productivity improvement.

## Independent Codex Operator Holdout

Three fresh Codex CLI 0.142.5 / GPT-5.4 sessions acted as first-time operators
in isolated git repositories with separate HOME, npm, and LoopRelay state. They
received only a local tarball, `TASK.md`, installed CLI help, a 12-command
budget, and one of three tasks: session recovery, rejected-approach prevention,
or release-state recovery.

Before remediation, first-value success was 0/3. One default sandbox could not
fetch npm dependencies, one operator exhausted its budget discovering hook
payload/quoting details, and one produced a generic zero-prompt brief that did
not preserve the task. These failures motivated the prompt-body-free
`looprelay loop checkpoint` command.

The supported-runtime remediation cohort passed 3/3. Time to first value was
101s, 82s, and 81s; command counts were 11, 11, and 9. Every operator found the
new command through CLI help and produced a task-specific brief. One additional
run selected unsupported Node 18 inside its isolated login shell and exceeded
the command budget while recovering; it is retained as runtime friction but
excluded from the Node 22 cohort.

These are independent agent operators, not independent human users. They show
that Codex can now install and operate the supported first-value flow, but they
do not satisfy the human 3-user gate or justify a causal productivity claim.

## Live Codex Connected Loop

A subsequent real Codex CLI 0.142.5 / GPT-5.4 sequence exercised the current
checkout through the registered LoopRelay MCP server:

1. CLI `loop checkpoint` recorded a real in-progress validation task on the
   current branch and `primary` worktree.
2. A fresh Codex session called `get_looprelay_loop_status` and
   `prepare_loop_brief` before reading repository files. It selected the exact
   checkpoint and recovered the task summary and verification contract.
3. A read-only Codex session inspected the implementation and attempted the
   focused Vitest checks. The tests could not start because Vite needs temporary
   writes; this sandbox friction is retained rather than counted as a product
   pass. The same focused tests passed outside that read-only agent sandbox.
4. Live use exposed a false multi-worktree review: legacy `unknown` worktree
   snapshots and the explicit `primary` checkpoint shared one branch but were
   counted separately. A focused regression now coalesces an unknown label into
   the sole explicit worktree on that branch.
5. A new Codex MCP process confirmed one active worktree and no review warning,
   then recorded the exact checkpoint as passed with focused-test and Node-build
   evidence.
6. After a newer Stop-hook snapshot existed, another fresh Codex process still
   selected the passed `primary` checkpoint and returned an eligible memory
   candidate. It did not write or approve memory automatically.

Post-run doctor reported verified recent ingest, HTTP 200, registered MCP, and
`ready`. MCP results remained local-only and returned neither prompt bodies nor
raw paths. This is end-to-end agent-operation evidence, not independent-human
evidence.

Two fail-closed Codex MCP checks followed. An unrelated cwd returned
`empty` with zero snapshots instead of falling back to LoopRelay project data,
and a missing worktree returned `not_found` plus a recovery command. Neither
response exposed a raw path or prompt body. The empty activity initially said
to continue a current worktree despite having none; the shared status model,
MCP schema, and web parser now agree on `create first local loop snapshot`.
A fresh Codex MCP process confirmed that corrected structured response.

## Reproduction And Remaining Gates

Run `pnpm evidence:usefulness` to validate the raw-free ledger and regenerate
the JSON summary, README result blocks, and SVG. The generated artifacts are
`reports/usefulness-summary.json` and `docs/assets/usefulness-results.svg`.
For a private Codex JSONL run, use
`pnpm evidence:codex-metrics -- <events.jsonl> <elapsed-ms>` to emit only
raw-free cost and tool metrics. The synthetic fixture contract and output
schema are under `evaluation/usefulness/`; raw Codex events and answer bodies
remain outside Git.

Three independent human install-to-first-value sessions are still required. Rendered
desktop/mobile QA is also pending because the in-app browser runtime did not
start in this session. Neither requirement may be replaced with maintainer
dogfood. The full release gate must run only once, on the final candidate after
these blockers are closed.
