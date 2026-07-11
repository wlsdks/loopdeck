export type ProjectEmptyState = {
  command: string;
  title: string;
};

export function getProjectEmptyState(): ProjectEmptyState {
  return {
    command: "looprelay setup --profile coach",
    title: "No project records yet.",
  };
}
