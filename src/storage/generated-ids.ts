import { randomUUID } from "node:crypto";

export function createImportJobId(): string {
  return `imp_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
}

export function createExportJobId(): string {
  return `exp_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
}

export function createPromptImprovementDraftId(): string {
  return `impdraft_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
}
