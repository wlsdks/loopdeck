import { useEffect, useState } from "react";

import type { LoopListResponse, ProjectSummary } from "./api.js";
import type { View } from "./routing.js";

export function shouldLoadProjects(
  viewName: View["name"],
  projectCount: number,
): boolean {
  return viewName === "projects" && projectCount === 0;
}

export function shouldLoadLoops(
  viewName: View["name"],
  hasLoops: boolean,
): boolean {
  return viewName === "loops" && !hasLoops;
}

export function updateProjectListItem(
  projects: ProjectSummary[],
  nextProject: ProjectSummary,
): ProjectSummary[] {
  return projects.map((project) =>
    project.project_id === nextProject.project_id ? nextProject : project,
  );
}

export function useWorkspaceQuery({
  listLoops,
  listProjects,
  viewName,
}: {
  listLoops(): Promise<LoopListResponse>;
  listProjects(): Promise<ProjectSummary[]>;
  viewName: View["name"];
}): {
  loops: LoopListResponse | undefined;
  projects: ProjectSummary[];
  setLoops: (loops: LoopListResponse | undefined) => void;
  updateProject(project: ProjectSummary): void;
} {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loops, setLoops] = useState<LoopListResponse | undefined>();

  useEffect(() => {
    if (!shouldLoadProjects(viewName, projects.length)) {
      return;
    }

    void listProjects()
      .then(setProjects)
      .catch(() => undefined);
  }, [listProjects, projects.length, viewName]);

  useEffect(() => {
    if (!shouldLoadLoops(viewName, Boolean(loops))) {
      return;
    }

    void listLoops()
      .then(setLoops)
      .catch(() => undefined);
  }, [listLoops, loops, viewName]);

  return {
    loops,
    projects,
    setLoops,
    updateProject(project): void {
      setProjects((current) => updateProjectListItem(current, project));
    },
  };
}
