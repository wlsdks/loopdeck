# Parser failure-prevention fixture

Two parser approaches are plausible. The previous external run is not stored in
Git. Do not infer its result from file order. This fixture is read-only.

- regular-expression extraction
- strict JSON parsing with explicit validation

Continue only when prior failure evidence identifies the rejected approach and
the next verification.
