export type ProjectEmptyState = {
  command: string;
  title: string;
};

export function getProjectEmptyState(): ProjectEmptyState {
  return {
    command: "promptlane setup --profile coach",
    title: "No project records yet.",
  };
}
