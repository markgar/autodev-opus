import { RestError } from "@azure/storage-blob";
import { blobServiceClient } from "../azure/blobClient.js";

const MAX_LINES = 5000;
const MAX_BLOBS = 100;

let blobAvailable = true;

export function setLogsBlobAvailable(available: boolean): void {
  blobAvailable = available;
}

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
  if (!blobAvailable) return [];

  const containerClient = blobServiceClient.getContainerClient(projectId);

  const blobEntries: { name: string; lastModified: Date }[] = [];
  try {
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.endsWith(".log") || blob.name === "events.jsonl") {
        blobEntries.push({
          name: blob.name,
          lastModified: blob.properties.lastModified ?? new Date(0),
        });
      }
    }
  } catch (error) {
    if (error instanceof RestError && error.statusCode === 404) {
      return [];
    }
    throw error;
  }

  if (blobEntries.length === 0) {
    return [];
  }

  blobEntries.sort(
    (a, b) => a.lastModified.getTime() - b.lastModified.getTime(),
  );
  const blobNames = blobEntries.slice(0, MAX_BLOBS).map((e) => e.name);

  const allLines: string[] = [];
  for (const blobName of blobNames) {
    if (allLines.length >= MAX_LINES) break;

    try {
      const text = await downloadBlobText(containerClient, blobName);
      const lines = text.split("\n").filter((line) => line.length > 0);
      for (const line of lines) {
        allLines.push(line);
        if (allLines.length >= MAX_LINES) break;
      }
    } catch (error) {
      if (error instanceof RestError && error.statusCode === 404) {
        continue;
      }
      throw error;
    }
  }

  allLines.sort();

  return allLines;
}
