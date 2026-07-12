import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Database,
  FileCheck2,
  FolderKanban,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

import type {
  ArchiveScoreReport,
  LoopListResponse,
  ProjectSummary,
  QualityDashboard,
} from "./api.js";
import {
  buildCommandCenterPriorities,
  getEvidenceCoverage,
  getLoopHealth,
  type CommandCenterPriority,
} from "./command-center-model.js";
import { QualityTrendChart } from "./charts.js";

import "./command-center.css";

export function CommandCenter({
  archiveScore,
  dashboard,
  health,
  loading,
  loops,
  measurementBusy,
  onMeasure,
  onOpenEvidence,
  onOpenInsights,
  onOpenLoop,
  onOpenProjects,
  projects,
  trendDays,
  onChangeTrendDays,
}: {
  archiveScore?: ArchiveScoreReport;
  dashboard?: QualityDashboard;
  health?: { ok: boolean; version: string; instance_id: string };
  loading: boolean;
  loops?: LoopListResponse;
  measurementBusy: boolean;
  onMeasure(): void;
  onOpenEvidence(): void;
  onOpenInsights(): void;
  onOpenLoop(worktree: string, branch?: string): void;
  onOpenProjects(): void;
  projects: ProjectSummary[];
  trendDays: 7 | 30;
  onChangeTrendDays(days: 7 | 30): void;
}) {
  const priorities = buildCommandCenterPriorities(loops);
  const coverage = getEvidenceCoverage(archiveScore);
  const loopHealth = getLoopHealth(loops);
  const activeWorktrees = loops?.status.activity.active_worktrees ?? 0;
  const activeSessions = loops?.status.activity.active_sessions ?? 0;
  const reviewCount = priorities.filter(
    (item) => item.priority !== "ready",
  ).length;

  if (loading && !dashboard) {
    return <div className="panel empty">Loading command center.</div>;
  }

  return (
    <div className="command-center" aria-label="Loop command center">
      <section className="command-center-heading">
        <div>
          <div className="command-center-title-row">
            <h2>Loop health</h2>
            <HealthIndicator health={loopHealth} />
          </div>
          <p>
            Review the next unstable loop, then continue with evidence attached.
          </p>
        </div>
        <div className="command-center-heading-actions">
          <button
            className="secondary-action"
            onClick={onOpenEvidence}
            type="button"
          >
            <FileCheck2 size={15} /> Evidence
          </button>
          <button
            className="primary-action"
            disabled={measurementBusy}
            onClick={onMeasure}
            type="button"
          >
            <RefreshCw size={15} />
            {measurementBusy ? "Measuring..." : "Refresh measurement"}
          </button>
        </div>
      </section>

      <section
        className="command-center-priority panel"
        aria-labelledby="priority-heading"
      >
        <div className="command-center-panel-heading">
          <div>
            <span className="command-center-kicker">Action queue</span>
            <h3 id="priority-heading">
              Needs attention {reviewCount > 0 ? reviewCount : ""}
            </h3>
          </div>
          <button
            className="text-action"
            onClick={onOpenProjects}
            type="button"
          >
            Projects <ArrowRight size={15} />
          </button>
        </div>
        {priorities.length === 0 ? (
          <EmptyPriorityState />
        ) : (
          <div className="command-center-priority-table" role="list">
            {priorities.slice(0, 4).map((item) => (
              <PriorityRow
                item={item}
                key={item.worktree}
                onOpenLoop={onOpenLoop}
              />
            ))}
          </div>
        )}
      </section>

      <div className="command-center-grid">
        <section className="command-center-panel panel command-center-trend">
          <div className="command-center-panel-heading">
            <div>
              <span className="command-center-kicker">Observed archive</span>
              <h3>Quality trend</h3>
            </div>
            <div className="command-center-window" aria-label="Trend window">
              <button
                className={trendDays === 7 ? "active" : ""}
                onClick={() => onChangeTrendDays(7)}
                type="button"
              >
                7d
              </button>
              <button
                className={trendDays === 30 ? "active" : ""}
                onClick={() => onChangeTrendDays(30)}
                type="button"
              >
                30d
              </button>
            </div>
          </div>
          {dashboard ? (
            <QualityTrendChart daily={dashboard.trend.daily} />
          ) : (
            <p className="muted">No local archive measurement yet.</p>
          )}
          <div className="command-center-trend-footer">
            <span>
              {dashboard
                ? `${dashboard.recent.last_30_days} prompts observed in the last 30 days`
                : "Archive activity will appear after local ingest."}
            </span>
            <button
              className="text-action"
              onClick={onOpenInsights}
              type="button"
            >
              Insights <ArrowRight size={15} />
            </button>
          </div>
        </section>

        <section className="command-center-panel panel command-center-evidence">
          <div className="command-center-panel-heading">
            <div>
              <span className="command-center-kicker">Evidence confidence</span>
              <h3>
                {coverage === undefined
                  ? "Not measured"
                  : `${coverage}% coverage`}
              </h3>
            </div>
            <ShieldCheck className="command-center-panel-icon" size={22} />
          </div>
          <div className="command-center-evidence-metrics">
            <EvidenceMetric
              label="Linked outcomes"
              value={
                archiveScore?.effectiveness_summary.calibration.linked_outcomes
              }
            />
            <EvidenceMetric
              label="Attributed outcomes"
              value={
                archiveScore?.effectiveness_summary.calibration
                  .attributed_outcomes
              }
            />
            <EvidenceMetric
              label="Passing outcomes"
              value={
                archiveScore?.effectiveness_summary.calibration.passing_outcomes
              }
            />
          </div>
          <p className="command-center-evidence-copy">
            {archiveScore?.effectiveness_summary.next_action ??
              "Collect an outcome after an agent loop to establish local evidence."}
          </p>
          <button
            className="text-action command-center-bottom-action"
            onClick={onOpenEvidence}
            type="button"
          >
            Review evidence <ArrowRight size={15} />
          </button>
        </section>

        <section className="command-center-panel panel command-center-projects">
          <div className="command-center-panel-heading">
            <div>
              <span className="command-center-kicker">Local workspace</span>
              <h3>Project signal</h3>
            </div>
            <FolderKanban className="command-center-panel-icon" size={22} />
          </div>
          <div className="command-center-project-metrics">
            <MetricTile label="Active worktrees" value={activeWorktrees} />
            <MetricTile label="Active sessions" value={activeSessions} />
            <MetricTile label="Projects" value={projects.length} />
          </div>
          {projects.length > 0 ? (
            <ul className="command-center-project-list">
              {projects.slice(0, 3).map((project) => (
                <li key={project.project_id}>
                  <span>{project.alias ?? project.label}</span>
                  <strong>
                    {Math.round(project.quality_gap_rate * 100)}% gap
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="command-center-evidence-copy">
              Projects will appear after the first local ingest.
            </p>
          )}
          <button
            className="text-action command-center-bottom-action"
            onClick={onOpenProjects}
            type="button"
          >
            Open projects <ArrowRight size={15} />
          </button>
        </section>
      </div>

      <section
        className="command-center-status-rail"
        aria-label="Local system status"
      >
        <StatusCell
          detail={health?.ok ? `v${health.version}` : "Checking local service"}
          icon={<Database size={16} />}
          label="Local service"
          status={health?.ok ? "healthy" : "checking"}
        />
        <StatusCell
          detail={
            loops
              ? `${loops.status.snapshot_count} snapshots`
              : "Loading loop snapshots"
          }
          icon={<Sparkles size={16} />}
          label="Continuity layer"
          status={loops?.status.status === "ready" ? "healthy" : "checking"}
        />
        <StatusCell
          detail={
            dashboard?.privacy.local_only
              ? "No external calls"
              : "Awaiting dashboard"
          }
          icon={<ShieldCheck size={16} />}
          label="Privacy boundary"
          status={dashboard?.privacy.local_only ? "healthy" : "checking"}
        />
      </section>
    </div>
  );
}

function PriorityRow({
  item,
  onOpenLoop,
}: {
  item: CommandCenterPriority;
  onOpenLoop(worktree: string, branch?: string): void;
}) {
  const label =
    item.priority === "urgent"
      ? "Urgent"
      : item.priority === "attention"
        ? "Review"
        : "Ready";
  return (
    <div
      className={`command-center-priority-row ${item.priority}`}
      role="listitem"
    >
      <span className="command-center-priority-badge">{label}</span>
      <div className="command-center-priority-name">
        <strong>{item.worktree}</strong>
        <span>{item.branch ?? "Local worktree"}</span>
      </div>
      <span className="command-center-priority-outcome">{item.outcome}</span>
      <span className="command-center-priority-detail">{item.detail}</span>
      <span className="command-center-priority-evidence">
        {item.evidenceCount} evidence
      </span>
      <button
        className="primary-button command-center-row-action"
        onClick={() => onOpenLoop(item.worktree, item.branch)}
        type="button"
      >
        Open loop <ArrowRight size={15} />
      </button>
    </div>
  );
}

function EmptyPriorityState() {
  return (
    <div className="command-center-empty-priority">
      <CheckCircle2 size={20} />
      <div>
        <strong>No active worktree needs review.</strong>
        <span>Start or ingest a local agent loop to populate this queue.</span>
      </div>
    </div>
  );
}

function HealthIndicator({
  health,
}: {
  health: "ready" | "attention" | "unknown";
}) {
  const Icon =
    health === "ready"
      ? CheckCircle2
      : health === "attention"
        ? CircleAlert
        : CircleDashed;
  const label =
    health === "ready"
      ? "Stable"
      : health === "attention"
        ? "Needs review"
        : "Awaiting data";
  return (
    <span className={`command-center-health ${health}`}>
      <Icon size={14} /> {label}
    </span>
  );
}

function EvidenceMetric({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <strong>{value ?? "—"}</strong>
      <span>{label}</span>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function StatusCell({
  detail,
  icon,
  label,
  status,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  status: "healthy" | "checking";
}) {
  return (
    <div className="command-center-status-cell">
      <span className={`command-center-status-icon ${status}`}>{icon}</span>
      <div>
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}
