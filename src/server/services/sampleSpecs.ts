import { blobServiceClient } from "../azure/blobClient.js";

const CONTAINER_NAME = "sample-specs";

function getContainerClient() {
  return blobServiceClient.getContainerClient(CONTAINER_NAME);
}

export interface SampleSpecEntry {
  name: string;
  size: number;
  lastModified: string;
}

export async function listSpecs(): Promise<SampleSpecEntry[]> {
  const container = getContainerClient();
  const specs: SampleSpecEntry[] = [];

  try {
    for await (const blob of container.listBlobsFlat()) {
      specs.push({
        name: blob.name,
        size: blob.properties.contentLength ?? 0,
        lastModified: blob.properties.lastModified?.toISOString() ?? "",
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to list sample specs: ${message}`);
  }

  return specs;
}

export async function getSpecContent(name: string): Promise<string> {
  const container = getContainerClient();
  const blobClient = container.getBlobClient(name);

  try {
    const response = await blobClient.download(0);
    const body = response.readableStreamBody;
    if (!body) {
      throw new Error("Empty response body");
    }

    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf-8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to download sample spec "${name}": ${message}`);
  }
}

export async function uploadSpec(
  name: string,
  content: string,
): Promise<void> {
  const container = getContainerClient();
  const blockBlobClient = container.getBlockBlobClient(name);

  try {
    await blockBlobClient.upload(content, Buffer.byteLength(content), {
      blobHTTPHeaders: { blobContentType: "text/markdown" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to upload sample spec "${name}": ${message}`);
  }
}

export async function deleteSpec(name: string): Promise<void> {
  const container = getContainerClient();
  const blobClient = container.getBlobClient(name);

  try {
    await blobClient.delete();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to delete sample spec "${name}": ${message}`);
  }
}
