import { ArrowUpRight, Bookmark, Copy, ShieldCheck } from "lucide-react";

import type { PromptFilters, QualityDashboard } from "./api.js";
import { DistributionBarChart } from "./charts.js";
import { isQualityGapKey } from "./quality-options.js";

export function InsightInventory({
  dashboard,
  onOpenEvidence,
  onOpenFilteredList,
  onOpenProjects,
  onSelect,
}: {
  dashboard: QualityDashboard;
  onOpenEvidence(): void;
  onOpenFilteredList(filters: PromptFilters): void;
  onOpenProjects(): void;
  onSelect(id: string): void;
}) {
  const trackedSignals = [
    {
      detail: `${dashboard.recent.last_7_days} in the last 7 days`,
      label: "Prompt archive",
      value: dashboard.total_prompts,
    },
    {
      detail: `${dashboard.quality_score.band} average`,
      label: "Quality scored",
      value: dashboard.quality_score.scored_prompts,
    },
    {
      detail: `${dashboard.distribution.by_tool.reduce(
        (total, bucket) => total + bucket.count,
        0,
      )} captured prompts`,
      label: "Capture sources",
      value: dashboard.distribution.by_tool.length,
    },
    {
      detail: `${dashboard.project_profiles.length} active profiles`,
      label: "Projects",
      value: dashboard.distribution.by_project.length,
    },
    {
      detail: "saved or copied",
      label: "Reusable prompts",
      value: dashboard.useful_prompts.length,
    },
    {
      detail: "repeated fingerprints",
      label: "Duplicate groups",
      value: dashboard.duplicate_prompt_groups.length,
    },
  ];

  return (
    <section className="insight-inventory" aria-label="Insight coverage">
      <header className="insight-inventory-heading">
        <div>
          <p className="eyebrow">Collected signals</p>
          <h2>Insight coverage</h2>
          <p>
            Every archive-level signal used for coaching is shown below, with no
            prompt bodies or raw paths exposed.
          </p>
        </div>
        <button
          className="secondary-action"
          onClick={onOpenEvidence}
          type="button"
        >
          Open evidence <ArrowUpRight size={15} />
        </button>
      </header>

      <div className="insight-signal-grid">
        {trackedSignals.map((signal) => (
          <div className="insight-signal" key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <small>{signal.detail}</small>
          </div>
        ))}
      </div>

      <div className="dashboard-grid wide insight-chart-grid">
        <section className="panel distribution-panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Capture mix</p>
              <h3>Sources by tool</h3>
            </div>
            <span>{dashboard.distribution.by_tool.length} tools</span>
          </div>
          <DistributionBarChart buckets={dashboard.distribution.by_tool} />
        </section>
        <section className="panel distribution-panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Coverage map</p>
              <h3>Prompts by project</h3>
            </div>
            <button
              aria-label="Open project profiles"
              className="text-action"
              onClick={onOpenProjects}
              type="button"
            >
              Projects <ArrowUpRight size={14} />
            </button>
          </div>
          <DistributionBarChart buckets={dashboard.distribution.by_project} />
        </section>
      </div>

      <div className="dashboard-grid wide insight-details-grid">
        <section className="panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Quality diagnosis</p>
              <h3>Missing or weak fields</h3>
            </div>
            <span>
              {dashboard.quality_score.average}/{dashboard.quality_score.max}
            </span>
          </div>
          <div className="gap-list">
            {dashboard.missing_items.length === 0 && (
              <p className="muted">No recurring weak or missing fields yet.</p>
            )}
            {dashboard.missing_items.map((item) => {
              const filter = isQualityGapKey(item.key)
                ? { focus: "quality-gap" as const, qualityGap: item.key }
                : undefined;
              return (
                <button
                  className="gap-row gap-action"
                  disabled={!filter}
                  key={item.key}
                  onClick={() => filter && onOpenFilteredList(filter)}
                  type="button"
                >
                  <span>
                    <strong>{item.label}</strong>
                    <small>
                      {item.missing} missing · {item.weak} weak / {item.total}
                    </small>
                  </span>
                  <strong>{Math.round(item.rate * 100)}%</strong>
                </button>
              );
            })}
          </div>
        </section>
        <section className="panel project-profile-panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Project comparison</p>
              <h3>Project quality profiles</h3>
            </div>
            <button
              aria-label="Manage project profiles"
              className="text-action"
              onClick={onOpenProjects}
              type="button"
            >
              Manage <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="project-profile-list">
            {dashboard.project_profiles.length === 0 && (
              <p className="muted">
                Project profiles appear after the first capture.
              </p>
            )}
            {dashboard.project_profiles.slice(0, 4).map((project) => (
              <div className="project-profile-row" key={project.key}>
                <div className="project-profile-main">
                  <div>
                    <strong>{project.label}</strong>
                    <small>{project.prompt_count} prompts observed</small>
                  </div>
                  <span>{project.average_quality_score}/100</span>
                </div>
                <div className="project-profile-metrics">
                  <span>
                    <strong>
                      {Math.round(project.quality_gap_rate * 100)}%
                    </strong>
                    gap rate
                  </span>
                  <span>
                    <strong>{project.copied_count}</strong>
                    copied
                  </span>
                  <span>
                    <strong>{project.bookmarked_count}</strong>
                    saved
                  </span>
                  <span>
                    <strong>{project.sensitive_count}</strong>
                    redacted
                  </span>
                </div>
                {project.top_gap && (
                  <div className="project-profile-gap">
                    <strong>{project.top_gap.label}</strong>
                    <small>{project.top_gap.count} recurring gaps</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-grid wide insight-details-grid">
        <section className="panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Adoption signals</p>
              <h3>Reusable prompts</h3>
            </div>
            <span>{dashboard.useful_prompts.length} tracked</span>
          </div>
          <div className="useful-list">
            {dashboard.useful_prompts.length === 0 && (
              <p className="muted">No saved or copied prompts yet.</p>
            )}
            {dashboard.useful_prompts.map((prompt) => (
              <button
                className="useful-row"
                key={prompt.id}
                onClick={() => onSelect(prompt.id)}
                type="button"
              >
                <span>
                  <strong>{prompt.cwd}</strong>
                  <small>
                    {prompt.tool} · {prompt.tags.join(", ") || "untagged"}
                  </small>
                </span>
                <span className="insight-useful-metrics">
                  {prompt.bookmarked && <Bookmark size={14} />}
                  <Copy size={14} /> {prompt.copied_count}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Repetition signals</p>
              <h3>Duplicate prompt groups</h3>
            </div>
            <span>{dashboard.duplicate_prompt_groups.length} groups</span>
          </div>
          <div className="duplicate-list">
            {dashboard.duplicate_prompt_groups.length === 0 && (
              <p className="muted">No repeated prompt fingerprints detected.</p>
            )}
            {dashboard.duplicate_prompt_groups.map((group) => (
              <div className="duplicate-group" key={group.group_id}>
                <div className="duplicate-group-header">
                  <strong>{group.count} matching captures</strong>
                  <span>{group.projects.join(" · ")}</span>
                </div>
                <div className="duplicate-prompts">
                  {group.prompts.slice(0, 3).map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => onSelect(prompt.id)}
                      type="button"
                    >
                      <span>{prompt.cwd}</span>
                      <small>
                        {prompt.tool} · {prompt.tags.join(", ") || "untagged"}
                      </small>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="insight-boundary">
        <ShieldCheck size={17} />
        <span>
          Local-only summary ·{" "}
          {dashboard.privacy.external_calls
            ? "external calls present"
            : "no external calls"}{" "}
          ·{" "}
          {dashboard.privacy.returns_prompt_bodies
            ? "prompt bodies visible"
            : "prompt bodies withheld"}{" "}
          ·{" "}
          {dashboard.privacy.returns_raw_paths
            ? "raw paths visible"
            : "raw paths withheld"}
        </span>
      </footer>
    </section>
  );
}
