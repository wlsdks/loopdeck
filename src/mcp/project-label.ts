import { deriveProjectLabel } from "../shared/project-label.js";

export function projectLabel(cwd: string): string {
  return deriveProjectLabel(cwd, "project");
}
