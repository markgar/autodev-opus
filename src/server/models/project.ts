export interface Project {
  id: string;
  organizationId: string;
  type: "project";
  name: string;
  specName: string;
  createdAt: string;
  latestRunStatus: "pending" | "running" | "succeeded" | "failed" | null;
  runCount: number;
}
