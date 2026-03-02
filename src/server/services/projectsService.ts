import { cosmosClient } from "../azure/cosmosClient.js";
import { cosmosDatabaseName, cosmosContainerName } from "../config.js";
import type { Project } from "../models/project.js";

const container = cosmosClient
  .database(cosmosDatabaseName)
  .container(cosmosContainerName);

export async function listProjects(): Promise<Project[]> {
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
