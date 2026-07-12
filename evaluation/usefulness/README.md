# Long-horizon usefulness fixtures

These synthetic repositories support privacy-safe Codex matched pairs. Raw
Codex JSONL, final answer bodies, LoopRelay data, and temporary git checkouts
must stay outside this repository.

## Fixed execution contract

- Codex CLI `0.144.1`
- model `gpt-5.4`
- reasoning effort `medium`
- `--ephemeral --ignore-user-config --ignore-rules`
- read-only sandbox
- one JSON output schema: `codex-output.schema.json`
- identical git commit for baseline and LoopRelay conditions
- fresh session for every condition
- counterbalanced condition order
- deterministic fixture state is the primary pass/fail ground truth

The baseline receives the task and repository. The treatment receives the same
inputs plus a locally generated LoopRelay diagnosis or continuation brief. A
LoopRelay artifact may not replace repository evidence and must be marked
adopted only when it was actually supplied to the agent.

`loop brief --json` may be consumed through a direct or wrapped response during
local version transitions. A harness must normalize it and reject an empty
brief before starting treatment:

```bash
jq -er '.prompt // .brief.prompt | select(type == "string" and length > 0)'
```

After a run, extract only body-free metrics:

```bash
pnpm evidence:codex-metrics -- /private/path/events.jsonl 30000
```

The ledger stores the metrics, fixture commit, outcome, order, and review
labels. It does not store prompts, answers, transcripts, raw paths, credentials,
or private Codex session identifiers.

If either condition records `privacy_blocker`, `data_loss_blocker`, or
`install_blocker`, the pair must set `blocker_resolution` to `open` or
`remediated`. Open pair blockers prevent public readiness. A remediated blocker
remains visible in the generated report as historical evidence and must not be
silently removed from the ledger.
