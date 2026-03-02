import { RestError } from "@azure/storage-blob";
import { blobServiceClient } from "../azure/blobClient.js";

const MAX_LINES = 5000;

async function downloadBlobText(
  containerClient: ReturnType<typeof blobServiceClient.getContainerClient>,
  blobName: string,
): Promise<string> {
  const blobClient = containerClient.getBlobClient(blobName);
  const response = await blobClient.download(0);
  const body = response.readableStreamBody;
  if (!body) {
    return "";
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export async function getProjectLogs(projectId: string): Promise<string[]> {
  const containerClient = blobServiceClient.getContainerClient(projectId);

  const blobNames: string[] = [];
  try {
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.endsWith(".log") || blob.name === "events.jsonl") {
        blobNames.push(blob.name);
      }
    }
  } catch (error) {
    if (error instanceof RestError && error.statusCode === 404) {
      return [];
    }
    throw error;
  }

  if (blobNames.length === 0) {
    return [];
  }

  const allLines: string[] = [];
  for (const blobName of blobNames) {
    try {
      const text = await downloadBlobText(containerClient, blobName);
      const lines = text.split("\n").filter((line) => line.length > 0);
      allLines.push(...lines);
    } catch (error) {
      if (error instanceof RestError && error.statusCode === 404) {
        continue;
      }
      throw error;
    }
  }

  return allLines.slice(0, MAX_LINES);
}
