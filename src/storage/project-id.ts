import { createHmac } from "node:crypto";
import { realpathSync } from "node:fs";
import { resolve } from "node:path";

export function createProjectKey(
  sourcePath: string,
  hmacSecret: string,
): string {
  const canonicalPath = canonicalProjectPath(sourcePath);
  return `proj_${createHmac("sha256", hmacSecret)
    .update(canonicalPath)
    .digest("hex")
    .slice(0, 24)}`;
}

function canonicalProjectPath(sourcePath: string): string {
  const absolutePath = resolve(sourcePath);
  try {
    return realpathSync.native(absolutePath);
  } catch {
    return absolutePath;
  }
}
