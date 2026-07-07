export function deriveProjectLabel(
  value: string,
  fallback = "unknown",
): string {
  const trimmed = value.trim().replace(/[\\/]+$/, "");
  return trimmed.split(/[\\/]/).filter(Boolean).at(-1) ?? fallback;
}
