import { blobServiceClient } from "../azure/blobClient.js";

let blobAvailable = true;

export function setContainerBlobAvailable(available: boolean): void {
  blobAvailable = available;
}

export async function ensureProjectContainer(
  projectId: string,
): Promise<void> {
  if (!blobAvailable) return;

  try {
    const containerClient = blobServiceClient.getContainerClient(projectId);
    await containerClient.createIfNotExists();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to create blob container for project "${projectId}": ${message}`,
    );
  }
}
