# Session recovery fixture

Two work items are intentionally plausible. The repository does not record
which one the previous session selected or which approach it rejected. Do not
infer prior-session decisions from file order.

- retry-policy: decide retry shape and verify `test:retry`
- cache-policy: decide invalidation shape and verify `test:cache`

This fixture is read-only. Return the recovered work item, rejected approach,
and next verification action when evidence exists. Otherwise ask for the
missing prior-session state.
