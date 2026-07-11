# Repeated failure fixture

The repository contains two plausible retry strategies and does not record the
result of the previous external integration attempt. Do not infer historical
outcomes from file order. This fixture is read-only.

- exponential backoff
- fixed delay capped by an attempt limit

Return the strategy to continue, the approach to avoid when evidence exists,
and the next verification action. Otherwise identify the missing evidence.
