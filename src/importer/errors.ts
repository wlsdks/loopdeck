export class ImportInputError extends Error {
  readonly isImportInputError = true as const;

  constructor(message: string) {
    super(message);
    this.name = "ImportInputError";
  }
}

export function isImportInputError(value: unknown): value is ImportInputError {
  return (
    value instanceof Error &&
    (value as { isImportInputError?: unknown }).isImportInputError === true
  );
}
