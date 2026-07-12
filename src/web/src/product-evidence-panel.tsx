import { ArrowUpRight, CircleAlert, ShieldCheck } from "lucide-react";

import {
  PRODUCT_EVIDENCE,
  RESUME_RELIABILITY_PROGRAM,
} from "./product-evidence-data.js";

import "./resume-reliability-detail.css";

export function ProductEvidencePanel() {
  const report = PRODUCT_EVIDENCE.primary;
  const successDelta =
    report.looprelay.success_rate - report.baseline.success_rate;
  const actionabilityDelta =
    report.looprelay.mean_actionability - report.baseline.mean_actionability;
  const tokenDelta =
    report.looprelay.mean_input_tokens - report.baseline.mean_input_tokens;
  const firstValueDelta =
    report.looprelay.mean_time_to_first_value_ms -
    report.baseline.mean_time_to_first_value_ms;
  const taskTypes = Object.entries(report.by_task_type).sort(
    ([left], [right]) => left.localeCompare(right),
  );

  return (
    <section
      className="panel product-evidence-panel"
      aria-label="Published product evidence"
    >
      <header className="product-evidence-heading">
        <div>
          <p className="eyebrow">Versioned product evidence</p>
          <h2>Published product evidence</h2>
          <p>
            This is repository evidence bundled with this release, not your
            local archive. It remains observational and does not establish a
            causal claim.
          </p>
        </div>
        <span className="product-evidence-status">
          <CircleAlert size={15} /> No causal claim
        </span>
      </header>

      <div className="product-evidence-cohorts">
        {PRODUCT_EVIDENCE.cohorts.map((cohort) => (
          <div className="product-evidence-cohort" key={cohort.label}>
            <span>{cohort.scope}</span>
            <strong>{cohort.report.pair_count} matched pairs</strong>
            <small>
              {cohort.report.task_type_count} task types · directional only
            </small>
          </div>
        ))}
      </div>

      <section
        className="resume-reliability-program"
        aria-label="Resume reliability program"
      >
        <div>
          <p className="eyebrow">Next evidence program</p>
          <h3>Resume reliability</h3>
          <p>
            Correct target, correct first action, and evidence attachment are
            measured separately from generic prompt quality.
          </p>
        </div>
        <strong>
          {RESUME_RELIABILITY_PROGRAM.pair_count}/
          {RESUME_RELIABILITY_PROGRAM.minimum_pairs} pairs
        </strong>
        <span>{RESUME_RELIABILITY_PROGRAM.status}</span>
        <small>
          Order balance: {RESUME_RELIABILITY_PROGRAM.order.baseline_first}/5
          &nbsp;baseline first ·{" "}
          {RESUME_RELIABILITY_PROGRAM.order.looprelay_first}
          /5 LoopRelay first
        </small>
        <small>
          Recovery coverage:{" "}
          {RESUME_RELIABILITY_PROGRAM.recovery_class_coverage.observed} classes
          &nbsp;(≥
          {RESUME_RELIABILITY_PROGRAM.recovery_class_coverage.required}{" "}
          required)
        </small>
        <small>
          Scored from tool-event traces; model self-report excluded.
        </small>
        <small>
          Agent-native blind recovery cohort; not a human-adoption result.
        </small>
        <small>{RESUME_RELIABILITY_PROGRAM.intervention.rationale}</small>
      </section>
      <ResumeReliabilityDetail />

      <div className="product-evidence-metrics">
        <EvidenceMetric
          baseline={formatPercent(report.baseline.success_rate)}
          label="Strict success"
          treatment={formatPercent(report.looprelay.success_rate)}
          delta={`${formatSignedPoints(successDelta)} pp`}
        />
        <EvidenceMetric
          baseline={formatPercent(report.baseline.mean_actionability)}
          label="Actionability"
          treatment={formatPercent(report.looprelay.mean_actionability)}
          delta={`${formatSignedPoints(actionabilityDelta)} pp`}
        />
        <EvidenceMetric
          baseline={formatSeconds(report.baseline.mean_time_to_first_value_ms)}
          label="First value"
          treatment={formatSeconds(
            report.looprelay.mean_time_to_first_value_ms,
          )}
          delta={formatSignedSeconds(firstValueDelta)}
        />
        <EvidenceMetric
          baseline={formatCompactNumber(report.baseline.mean_input_tokens)}
          label="Input tokens"
          treatment={formatCompactNumber(report.looprelay.mean_input_tokens)}
          delta={formatSignedPercent(
            tokenDelta / report.baseline.mean_input_tokens,
          )}
        />
      </div>

      <div className="product-evidence-transitions">
        <div>
          <span>Outcome transitions</span>
          <strong>{report.transitions.improved} improved</strong>
        </div>
        <span>{report.transitions.regressed} regressed</span>
        <span>{report.transitions.unchanged_passed} unchanged passed</span>
        <span>{report.transitions.unchanged_failed} unchanged failed</span>
      </div>

      <div className="product-evidence-task-list">
        <div className="product-evidence-task-heading">
          <div>
            <p className="eyebrow">Scope decisions</p>
            <h3>What the task-level evidence says</h3>
          </div>
          <span>Keep, narrow, or hold based on observed direction</span>
        </div>
        {taskTypes.map(([taskType, task]) => (
          <div className="product-evidence-task" key={taskType}>
            <strong>{formatTaskType(taskType)}</strong>
            <span>{task.pair_count} pairs</span>
            <span>
              {formatSignedPoints(task.success_rate_delta)} pp success
            </span>
            <em className={`product-evidence-decision ${task.decision.action}`}>
              {task.decision.action}
            </em>
          </div>
        ))}
      </div>

      <footer className="product-evidence-boundary">
        <ShieldCheck size={16} />
        <span>
          {report.independent_user_count} independent users ·{" "}
          {report.independent_humans.successful_flow_count} successful human
          flows · agent-operator release gate{" "}
          {report.public_readiness.ready ? "ready" : "not ready"}
        </span>
        <a href="https://github.com/wlsdks/looprelay/blob/main/docs/ENGINEERING_USEFULNESS_VALIDATION_2026-07-11.md">
          Read method <ArrowUpRight size={14} />
        </a>
      </footer>
    </section>
  );
}

function ResumeReliabilityDetail() {
  const report = RESUME_RELIABILITY_PROGRAM;
  return (
    <section
      className="resume-reliability-detail"
      aria-label="Resume reliability evidence detail"
    >
      <div>
        <p className="eyebrow">Decision basis</p>
        <h3>What this cohort supports</h3>
        <p>
          The cohort supports a better first recovery action, not a broad
          productivity claim or automatic intervention.
        </p>
      </div>
      <div className="resume-reliability-detail-grid">
        <ResumeMetric
          baseline={report.baseline.correct_first_action_rate}
          label="Correct first action"
          treatment={report.looprelay.correct_first_action_rate}
        />
        <ResumeMetric
          baseline={report.baseline.evidence_attached_rate}
          label="Evidence attached"
          treatment={report.looprelay.evidence_attached_rate}
        />
        <ResumeMetric
          baseline={report.baseline.mean_friction_count}
          label="Mean friction"
          treatment={report.looprelay.mean_friction_count}
          rawNumber
        />
      </div>
      <small>
        Retained transitions: {report.transitions.improved} improved ·{" "}
        {report.transitions.regressed} regressed ·{" "}
        {report.transitions.unchanged_failed} unchanged failed. Target selection
        did not improve, so generic intervention remains off.
      </small>
      <details className="resume-reliability-method">
        <summary>Inspect cohort coverage and data boundary</summary>
        <div>
          <p>
            {report.cohort.replaceAll("_", " ")} ·{" "}
            {report.scoring.method.replaceAll("_", " ")} · model self-report{" "}
            {report.scoring.model_self_report_used ? "included" : "excluded"}.
          </p>
          <dl>
            {Object.entries(report.recovery_class_coverage.counts).map(
              ([recoveryClass, count]) => (
                <div key={recoveryClass}>
                  <dt>{recoveryClass.replaceAll("_", " ")}</dt>
                  <dd>
                    {count} pair{count === 1 ? "" : "s"}
                  </dd>
                </div>
              ),
            )}
          </dl>
          <p>
            Raw-free archive:{" "}
            {report.privacy.stores_prompt_bodies ? "stores" : "does not store"}{" "}
            prompt bodies, raw paths, branch names, or worktree names.
          </p>
        </div>
      </details>
    </section>
  );
}

function ResumeMetric({
  baseline,
  label,
  rawNumber = false,
  treatment,
}: {
  baseline: number | null;
  label: string;
  rawNumber?: boolean;
  treatment: number | null;
}) {
  return (
    <div className="resume-reliability-detail-metric">
      <span>{label}</span>
      <strong>
        {formatResumeMetric(baseline, rawNumber)} <small>→</small>{" "}
        {formatResumeMetric(treatment, rawNumber)}
      </strong>
    </div>
  );
}

function EvidenceMetric({
  baseline,
  delta,
  label,
  treatment,
}: {
  baseline: string;
  delta: string;
  label: string;
  treatment: string;
}) {
  return (
    <div className="product-evidence-metric">
      <span>{label}</span>
      <strong>
        {baseline} <small>→</small> {treatment}
      </strong>
      <em>{delta}</em>
    </div>
  );
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatResumeMetric(value: number | null, rawNumber: boolean): string {
  if (value === null) return "—";
  return rawNumber ? value.toFixed(1) : formatPercent(value);
}

function formatSignedPoints(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}`;
}

function formatCompactNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

function formatSeconds(value: number): string {
  return `${(value / 1000).toFixed(1)}s`;
}

function formatSignedSeconds(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value / 1000).toFixed(1)}s`;
}

function formatSignedPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function formatTaskType(value: string): string {
  return value.replaceAll("_", " ");
}
