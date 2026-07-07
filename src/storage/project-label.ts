import { deriveProjectLabel } from "../shared/project-label.js";

export function projectLabel(value: string): string {
  return deriveProjectLabel(value, "unknown");
}
