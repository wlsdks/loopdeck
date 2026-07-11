# Engineering Usefulness Validation — 2026-07-11

This is a live, observational validation ledger for LoopRelay's continuity and
evidence workflows. It does not make a causal product claim.

## Human Evaluation Contract

Each matched pair uses the same agent, model, repository, read-only boundary,
requested output, and tool budget. Human review scores five dimensions:

1. correct engineering outcome
2. recovery of the active project and branch context
3. identification of the highest-priority blocker
4. actionability of the smallest next step and verification
5. operator friction and tool efficiency

Negative, null, incomplete, and retried runs remain part of the friction log.
Only pairs with completed baseline and treatment outputs count toward the live
corpus.

## Pair 001 — Continuity Priority Selection

- Task type: resume a long-running product-validation loop and select the next
  engineering action.
- Agent condition: Codex CLI 0.142.5, `gpt-5.4`, low reasoning effort,
  read-only sandbox, at most five repository commands.
- Baseline: repository context only.
- Treatment: the same request plus LoopRelay's current project, branch, goal,
  prompt-gap, and verification context.
- Both conditions completed successfully and identified the missing live
  matched-pair corpus as the primary blocker.
- Baseline proposed collecting all 10 pairs and three users as the next action.
- Treatment proposed closing one reproducible pair first, then expanding the
  same protocol across three task types. Human review judged this more
  immediately actionable.
- Baseline used 3 command calls and 87,213 input tokens, including 78,464
  cached tokens.
- Treatment used 4 command calls and 114,242 input tokens, including 83,968
  cached tokens.
- Outcome transition: unchanged passed. No task-success lift was observed.
- Human signal: better next-action granularity, with higher context and tool
  cost.
- Automated paired report: `insufficient_pairs`, pair count 1, baseline pass
  rate 1.0, treatment pass rate 1.0, delta 0, privacy leaks 0,
  `causal_claim: false`.
- Friction: the first unrestricted baseline did not produce a final answer;
  the first full-brief treatment attempt also ended before tool use. Both were
  excluded, then retried once with a fixed five-command budget. This makes
  runner completion and brief size part of the observed friction.

The consent-bearing local fixture is stored outside the repository at
`~/.looprelay/evidence/continuity-pair-001.json` with owner-only permissions.
Prompt bodies are not committed here.

## Human-Visible Management Check

Before remediation, plain `looprelay loop status` mixed projects, selected a
newer unrelated project, printed long prompt-id and worktree diagnostics, and
could direct `looprelay loop brief` to that unrelated snapshot.

After remediation:

- status and default brief selection are scoped to the current project;
- `--all-projects` preserves explicit global inspection;
- `--verbose` preserves detailed diagnostics;
- the default status is an eight-line Managed, Attention, Evidence, Latest,
  and Next summary;
- the live summary reports 1 baseline and 1 LoopRelay candidate ready for pair
  review without returning prompt bodies or raw paths.

Rendered browser QA remains pending because the Codex in-app browser runtime
could not start in this session. No standalone-browser fallback was used.

## Current Decision

Keep the current-project status and brief scoping. Continue collecting real
pairs. Do not claim outcome improvement from Pair 001; investigate whether a
shorter continuation brief preserves the actionability signal with less token
and tool overhead.
