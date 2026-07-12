import {
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  FolderGit2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import type {
  LoopListResponse,
  ProjectPolicyPatch,
  ProjectSummary,
} from "./api.js";
import { formatDate, formatRulesFileCount } from "./formatters.js";

import "./project-workspace.css";

export function ProjectWorkspace({
  instructionBusy,
  loops,
  onAnalyzeInstructions,
  onBack,
  onOpenLoop,
  onUpdatePolicy,
  project,
}: {
  instructionBusy: boolean;
  loops?: LoopListResponse;
  onAnalyzeInstructions(): void;
  onBack(): void;
  onOpenLoop(worktree?: string, branch?: string): void;
  onUpdatePolicy(patch: ProjectPolicyPatch): void;
  project?: ProjectSummary;
}) {
  if (!project) {
    return (
      <section
        className="panel project-workspace-empty"
        aria-label="Project workspace"
      >
        <h2>Project not found</h2>
        <p>
          This local project is no longer available in the current archive. Go
          back to Projects and choose a current record.
        </p>
        <button className="secondary-action" onClick={onBack} type="button">
          <ArrowLeft size={15} /> Back to projects
        </button>
      </section>
    );
  }

  const projectLoops = (loops?.items ?? []).filter(
    (loop) => loop.project_id === project.project_id,
  );
  const latestLoop = projectLoops[0];
  const status = getWorkspaceStatus(latestLoop);
  const policy = project.policy;
  const feedback = project.feedback ?? {
    helpful: 0,
    not_helpful: 0,
    total: 0,
    wrong: 0,
  };
  const attributedImprovements =
    latestLoop?.used_improvement_prompt_ids?.length ?? 0;

  return (
    <section className="project-workspace" aria-label="Project workspace">
      <header className="project-workspace-heading">
        <div>
          <button className="back-link" onClick={onBack} type="button">
            <ArrowLeft size={14} /> Projects
          </button>
          <p className="eyebrow">Local continuity workspace</p>
          <h2>{project.label}</h2>
          <p>
            Project-scoped continuity, observed evidence, and reversible local
            policy controls.
          </p>
        </div>
        <span className={`project-workspace-status ${status.tone}`}>
          {status.label}
        </span>
      </header>

      <div className="project-workspace-metrics" aria-label="Project signal">
        <Metric label="Stored prompts" value={project.prompt_count} />
        <Metric
          label="Quality gap"
          value={`${Math.round(project.quality_gap_rate * 100)}%`}
        />
        <Metric label="Sensitive" value={project.sensitive_count} />
        <Metric
          label="Reusable"
          value={project.copied_count + project.bookmarked_count}
        />
      </div>

      <div className="project-workspace-grid">
        <section className="panel project-workspace-card">
          <div className="project-workspace-card-heading">
            <div>
              <p className="eyebrow">Continue safely</p>
              <h3>Latest loop</h3>
            </div>
            <FolderGit2 size={19} />
          </div>
          {latestLoop ? (
            <>
              <strong>{latestLoop.worktree ?? "Local project loop"}</strong>
              <p>{status.detail}</p>
              <dl className="project-workspace-facts">
                <div>
                  <dt>Outcome</dt>
                  <dd>{latestLoop.outcome_status.replaceAll("_", " ")}</dd>
                </div>
                <div>
                  <dt>Last snapshot</dt>
                  <dd>{formatDate(latestLoop.created_at)}</dd>
                </div>
                <div>
                  <dt>Evidence signal</dt>
                  <dd>{latestLoop.prompt_count} linked prompts</dd>
                </div>
              </dl>
              <button
                className="primary-action"
                onClick={() =>
                  onOpenLoop(latestLoop.worktree, latestLoop.branch)
                }
                type="button"
              >
                {status.action} <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <>
              <p>
                No loop snapshot is linked to this project yet. Create one after
                a meaningful agent checkpoint so recovery has evidence.
              </p>
              <button
                className="secondary-action"
                onClick={() => onOpenLoop()}
                type="button"
              >
                Open loops <ArrowRight size={15} />
              </button>
            </>
          )}
        </section>

        <section className="panel project-workspace-card">
          <div className="project-workspace-card-heading">
            <div>
              <p className="eyebrow">Evidence readiness</p>
              <h3>Agent rules</h3>
            </div>
            <FileCheck2 size={19} />
          </div>
          {project.instruction_review ? (
            <>
              <strong>
                {project.instruction_review.score.value}/
                {project.instruction_review.score.max} rules score
              </strong>
              <p>
                {formatRulesFileCount(project.instruction_review.files_found)}
                {project.instruction_review.suggestions[0]
                  ? ` · ${project.instruction_review.suggestions[0]}`
                  : " · No new rule change suggested."}
              </p>
            </>
          ) : (
            <p>
              No project-rule review yet. Inspect AGENTS.md and CLAUDE.md before
              treating this project as ready for long-running agent work.
            </p>
          )}
          <button
            className="secondary-action"
            disabled={instructionBusy}
            onClick={onAnalyzeInstructions}
            type="button"
          >
            <RefreshCw size={15} />
            {instructionBusy ? "Analyzing rules..." : "Analyze rules"}
          </button>
        </section>
      </div>

      <section className="panel project-workspace-card project-adoption-card">
        <div className="project-workspace-card-heading">
          <div>
            <p className="eyebrow">Closed-loop evidence</p>
            <h3>Recommendation adoption</h3>
          </div>
          <FileCheck2 size={19} />
        </div>
        <div className="project-adoption-metrics">
          <Metric
            label="Coach helpful"
            value={`${feedback.helpful}/${feedback.total}`}
          />
          <Metric
            label="Not helpful"
            value={feedback.not_helpful + feedback.wrong}
          />
          <Metric
            label="Attributed in latest outcome"
            value={attributedImprovements}
          />
        </div>
        <p>
          Feedback records whether a recommendation was useful. Attribution is
          counted only when the loop outcome explicitly records that an improved
          prompt was actually used; neither measure proves causality.
        </p>
      </section>

      <section className="panel project-policy-workspace">
        <div className="project-workspace-card-heading">
          <div>
            <p className="eyebrow">Privacy boundary</p>
            <h3>Local project policy</h3>
          </div>
          <ShieldCheck size={19} />
        </div>
        <p>
          These controls change only this project's local collection, export,
          and future-review boundary. They never delete archived records or
          start an external request by themselves.
        </p>
        <div className="project-policy-actions">
          <PolicyToggle
            checked={!policy.capture_disabled}
            detail="Keep new local agent events available for continuity."
            label="Capture"
            onChange={() =>
              onUpdatePolicy({ capture_disabled: !policy.capture_disabled })
            }
          />
          <PolicyToggle
            checked={!policy.analysis_disabled}
            detail="Include captured metadata in local quality analysis."
            label="Local analysis"
            onChange={() =>
              onUpdatePolicy({ analysis_disabled: !policy.analysis_disabled })
            }
          />
          <PolicyToggle
            checked={!policy.export_disabled}
            detail="Allow this project in an explicit anonymized export preview."
            label="Anonymized export"
            onChange={() =>
              onUpdatePolicy({ export_disabled: !policy.export_disabled })
            }
          />
        </div>
        <div className="project-policy-lifecycle" aria-label="Data lifecycle">
          <label className="project-policy-select">
            <span>
              <strong>Retention review</strong>
              <small>
                Sets a local review reminder only. It does not delete data.
              </small>
            </span>
            <select
              aria-label="Retention review"
              onChange={(event) =>
                onUpdatePolicy({
                  retention_candidate_days:
                    event.target.value === ""
                      ? null
                      : Number.parseInt(event.target.value, 10),
                })
              }
              value={policy.retention_candidate_days ?? ""}
            >
              <option value="">No review date</option>
              <option value="30">Review in 30 days</option>
              <option value="90">Review in 90 days</option>
              <option value="365">Review in 365 days</option>
            </select>
          </label>
          <PolicyToggle
            checked={policy.external_analysis_opt_in}
            detail="Record permission for a separately confirmed future action; this switch makes no request."
            label="External analysis permission"
            onChange={() =>
              onUpdatePolicy({
                external_analysis_opt_in: !policy.external_analysis_opt_in,
              })
            }
          />
        </div>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="project-workspace-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PolicyToggle({
  checked,
  detail,
  label,
  onChange,
}: {
  checked: boolean;
  detail: string;
  label: string;
  onChange(): void;
}) {
  return (
    <label className="project-policy-toggle">
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <input checked={checked} onChange={onChange} type="checkbox" />
      <em>{checked ? "On" : "Off"}</em>
    </label>
  );
}

function getWorkspaceStatus(
  loop: LoopListResponse["items"][number] | undefined,
): {
  action: string;
  detail: string;
  label: string;
  tone: "good" | "warning" | "muted";
} {
  if (!loop) {
    return {
      action: "Open loops",
      detail: "No local loop snapshot is available yet.",
      label: "Needs checkpoint",
      tone: "muted",
    };
  }
  if (loop.compact_boundary?.after_latest_snapshot) {
    return {
      action: "Refresh loop",
      detail:
        "A compaction boundary follows this snapshot; refresh it before continuing.",
      label: "Refresh required",
      tone: "warning",
    };
  }
  if (["failed", "blocked", "abandoned"].includes(loop.outcome_status)) {
    return {
      action: "Review recovery",
      detail:
        "The last outcome needs an explicit recovery decision before ordinary work continues.",
      label: "Needs review",
      tone: "warning",
    };
  }
  if (["unknown", "in_progress"].includes(loop.outcome_status)) {
    return {
      action: "Record outcome",
      detail: "The current loop has no completed evidence-bearing outcome yet.",
      label: "Outcome pending",
      tone: "muted",
    };
  }
  return {
    action: "Open loop",
    detail:
      "The latest outcome is recorded; review its evidence before the next continuation decision.",
    label: "Evidence ready",
    tone: "good",
  };
}
