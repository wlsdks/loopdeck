# PromptLane 1.0 Public Launch Validation - 2026-07-10

This document is the evidence ledger for the public-launch and usefulness
validation phase. Product feature development is frozen unless evidence below
identifies a privacy, data-loss, installation, or first-value blocker.

## Current Verdict

PromptLane 1.0.0 is not publicly launched yet.

- The annotated `v1.0.0` tag and `main` resolve to commit
  `106bbf899d8243f31e122a7496208b144bedc869`.
- `promptlane@1.0.0` returned npm registry `E404` on 2026-07-10.
- GitHub had no `v1.0.0` Release on 2026-07-10.
- `corepack pnpm npm-publish:preflight -- --json` passed every package,
  privacy, worktree, tag, and remote-tag check. Its only failed check was npm
  authentication (`npm whoami` returned `E401`).
- Do not move `v1.0.0`. Authenticate, rerun the final gate and preflight from
  the tagged commit, publish that commit, and create the GitHub Release from
  the same immutable tag.

## Live Codex And Claude Code Evidence

These are real installed CLI sessions, not fake-provider or isolated setup
smokes.

| Surface | Result | Evidence |
| --- | --- | --- |
| Codex CLI 0.142.5 prompt ingest | PASS | A new Codex prompt was captured at `2026-07-10T11:31:06Z`; immediate `doctor codex --json` reported recent ingest and `status: ready`. |
| Codex PromptLane MCP call | PASS | The same live session called `get_promptlane_status` once; the structured result reported `status: ready`, local-only operation, no external calls, no prompt bodies, and no raw paths. |
| Claude Code 2.1.204 prompt ingest | PASS | A new Claude Code prompt was captured at `2026-07-10T11:31:26Z`; `doctor claude-code --json` reported recent ingest and `status: ready`. |
| Claude Code PromptLane MCP call | PASS | The same live session called `get_promptlane_status` once and received `status: ready` with the latest safe metadata attributed to `claude-code`. |
| MCP registration | PASS | `codex mcp list` reported `promptlane` enabled and `claude mcp list` reported it connected before the live calls. |

Observed friction:

- The first Codex attempt failed before MCP use because the locally configured
  `gpt-5.6-sol` requires a newer Codex CLI. Retrying with explicit model
  `gpt-5.4` completed the ingest and MCP call. This is environment/version
  friction, not evidence of a PromptLane MCP failure.
- The Claude Code call and final response completed, but the process returned
  non-zero because total cost reached `$0.2666307` against a `$0.25` cap. Treat
  this as first-run cost/predictability friction; do not count it as a failed
  PromptLane tool call.

## Clean Installation And First Value

`corepack pnpm smoke:package-install` passed on 2026-07-10. It built a local
`promptlane-1.0.0.tgz`, installed it with an isolated temporary environment,
and verified:

- the `promptlane`, `pl-claude`, and `pl-codex` binaries;
- the first-success command `promptlane start --open-web --json`;
- installed benchmark fixture, paired-fixture, candidate, and quality-evidence
  commands.

A separate clean temporary HOME/prefix run installed the same local 1.0.0
tarball and executed a benign `promptlane improve --text ... --json` request:

| Measurement | Observed result |
| --- | ---: |
| Global-prefix install | 13.375 seconds |
| Improvement command | 0.478 seconds |
| Install start to first improvement | 13.898 seconds |
| Local score change | 58 to 100 (+42) |

The command returned a non-empty approval-ready improvement. Installation had
no failure, so no failure recovery was needed. Both temporary HOME and prefix
were removed after the run; repeating the install in newly created directories
is the verified clean retry path. The score delta proves deterministic local
scoring behavior for this fixture, not real task effectiveness.

This proves the pre-publish local tarball path through an actual improvement
result. It does not prove registry installation. After npm publication, repeat
installation from `promptlane@1.0.0` in a new temporary environment and record
elapsed time, installation failures, first-value time, and recovery steps.

## Usefulness Evidence

The live synthetic benchmark on 2026-07-10 passed its regression thresholds but
explicitly reported:

- `evidence_state.effectiveness: regression_gate_passed_not_real_world_proof`;
- `counts.effect_pairs: 0` for the synthetic fixture;
- `paired_effectiveness.status: not_collected`;
- `paired_effectiveness.causal_claim: false`.

A first real, operator-reviewed Codex pair was then collected for the task
"call `get_promptlane_status` exactly once and report readiness":

| Condition | Outcome | Observation |
| --- | --- | --- |
| Baseline | PASS | The live Codex session called the requested PromptLane MCP tool and received `ready`. |
| PromptLane treatment | FAIL | The generated stored-prompt rewrite replaced the concrete MCP goal with a placeholder referring to the stored request's target. The live Codex session returned a final response but made zero PromptLane MCP calls. |

A second pair covered a different task type, a read-only repository release
audit that had to compare the `v1.0.0` target with `main` and report whether the
worktree was clean:

| Condition | Outcome | Observation |
| --- | --- | --- |
| Baseline | PASS | Six command events produced the correct shared commit, equality decision, and clean-worktree result. |
| PromptLane treatment | FAIL | The adopted draft again contained a stored-request placeholder. It produced 42 command events, investigated unrelated rewrite code and tests, and omitted the required tag, clean-worktree, and expected-SHA results. |

The combined two-pair real-fixture benchmark reported:

- `pair_count: 2` and `status: insufficient_pairs`;
- baseline pass rate `1.0`, PromptLane pass rate `0.0`;
- two `regressed` transitions;
- treatment adoption `2/2`, because both generated drafts were actually
  submitted;
- `causal_claim: false` and a non-release-blocking soft-signal failure;
- privacy leak count `0`.

The consent-bearing fixture was used locally and removed after measurement
because it contains prompt text. Only this raw-free aggregate is committed.

This observation does not establish a product-wide negative effect. It does
establish one concrete limitation: stored-prompt rewrites can lose the actual
goal when only redacted stored context is available. Until broader evidence is
collected, retain direct-text local improvement but do not claim that
`improve --prompt-id` reliably preserves a stored prompt's task target. Treat
that surface as a 1.0.x change-or-remove candidate.

Therefore real-world usefulness remains unproven. No success-rate lift or
causal claim is permitted yet.

Required before closing validation:

- collect at least 10 operator-reviewed matched baseline/PromptLane pairs;
- cover at least three task types;
- record success, failure transitions, improvement adoption, time to first
  value, and friction without exposing prompt bodies or raw paths;
- have at least three external or otherwise independent users complete install
  and first value;
- record zero critical privacy, data-loss, and installation blockers;
- rewrite the 1.0.x backlog from observed keep/change/remove evidence, including
  scope reduction when usefulness is not supported.

## Next Actions

1. Complete `npm login` interactively.
2. From the immutable tagged commit, run the full release gate once and rerun
   `corepack pnpm npm-publish:preflight`.
3. Publish `promptlane@1.0.0`, then create the GitHub Release from `v1.0.0`
   without retargeting the tag.
4. Run a clean registry-install first-value smoke and record elapsed time and
   recovery observations.
5. Continue from 2/10 matched pairs using explicit operator review, and cover
   at least three task types.
6. Recruit three independent users; do not replace their evidence with
   synthetic fixtures or maintainer-only dogfood.
