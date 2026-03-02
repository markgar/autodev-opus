import { randomUUID } from "node:crypto";
import { cosmosClient } from "../azure/cosmosClient.js";
import { cosmosDatabaseName, cosmosContainerName } from "../config.js";
import type { Project } from "../models/project.js";

const container = cosmosClient
  .database(cosmosDatabaseName)
  .container(cosmosContainerName);

let cosmosAvailable = true;

export function setCosmosAvailable(available: boolean): void {
  cosmosAvailable = available;
}

// --- In-memory fallback store for when Cosmos DB is unavailable ---

const memoryProjects: Project[] = [];

function memoryListProjects(): Project[] {
  return [...memoryProjects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function memoryGetProjectById(id: string): Project | null {
  return memoryProjects.find((p) => p.id === id) ?? null;
}

function memoryCreateProject(name: string, specName: string): Project {
  const project: Project = {
    id: randomUUID(),
    organizationId: "default",
    type: "project",
    name,
    specName,
    createdAt: new Date().toISOString(),
    latestRunStatus: null,
    runCount: 0,
  };
  memoryProjects.push(project);
  return project;
}

// --- Public API ---

export async function listProjects(): Promise<Project[]> {
  if (!cosmosAvailable) return memoryListProjects();

  try {
    const { resources } = await container.items
      .query<Project>({
        query:
          "SELECT TOP 100 * FROM c WHERE c.organizationId = @orgId AND c.type = \"project\" ORDER BY c.createdAt DESC",
        parameters: [{ name: "@orgId", value: "default" }],
      })
      .fetchAll();
    return resources;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to list projects: ${message}`);
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!cosmosAvailable) return memoryGetProjectById(id);

  try {
    const { resource } = await container.item(id, "default").read<Project>();
    return resource ?? null;
  } catch (error) {
    const code = (error as { code?: number | string }).code;
    if (code === 404 || code === "NotFound") {
      return null;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get project "${id}": ${message}`);
  }
}

export async function createProject(
  name: string,
  specName: string,
): Promise<Project> {
  if (!cosmosAvailable) return memoryCreateProject(name, specName);

  const project: Project = {
    id: randomUUID(),
    organizationId: "default",
    type: "project",
    name,
    specName,
    createdAt: new Date().toISOString(),
    latestRunStatus: null,
    runCount: 0,
  };

  try {
    await container.items.create(project);
    return project;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create project: ${message}`);
  }
}
