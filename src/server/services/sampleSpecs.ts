import { RestError } from "@azure/storage-blob";
import { blobServiceClient } from "../azure/blobClient.js";

const CONTAINER_NAME = "sample-specs";
const MAX_SPECS = 1000;

function getContainerClient() {
  return blobServiceClient.getContainerClient(CONTAINER_NAME);
}

export class SpecNotFoundError extends Error {
  constructor(name: string) {
    super(`Spec "${name}" not found`);
    this.name = "SpecNotFoundError";
  }
}

/** Validates a spec filename: alphanumeric start, simple chars, ends with .md, max 255 chars. */
export function isValidSpecName(name: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,250}\.md$/.test(name) && !name.includes("..");
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof RestError && error.statusCode === 404;
}

export interface SampleSpecEntry {
  name: string;
  size: number;
  lastModified: string;
}

export async function listSpecs(): Promise<SampleSpecEntry[]> {
  const container = getContainerClient();
  const specs: SampleSpecEntry[] = [];

  for await (const blob of container.listBlobsFlat()) {
    specs.push({
      name: blob.name,
      size: blob.properties.contentLength ?? 0,
      lastModified: blob.properties.lastModified?.toISOString() ?? "",
    });
    if (specs.length >= MAX_SPECS) break;
  }

  return specs;
}

export async function getSpecContent(name: string): Promise<string> {
  const container = getContainerClient();
  const blobClient = container.getBlobClient(name);

  const response = await blobClient.download(0).catch((error) => {
    if (isNotFoundError(error)) throw new SpecNotFoundError(name);
    throw error;
  });

  const body = response.readableStreamBody;
  if (!body) {
    throw new Error("Empty response body");
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export async function uploadSpec(
  name: string,
  content: string,
): Promise<void> {
  const container = getContainerClient();
  const blockBlobClient = container.getBlockBlobClient(name);

  await blockBlobClient.upload(content, Buffer.byteLength(content), {
    blobHTTPHeaders: { blobContentType: "text/markdown" },
  });
}

export async function deleteSpec(name: string): Promise<void> {
  const container = getContainerClient();
  const blobClient = container.getBlobClient(name);

  await blobClient.delete().catch((error) => {
    if (isNotFoundError(error)) throw new SpecNotFoundError(name);
    throw error;
  });
}
