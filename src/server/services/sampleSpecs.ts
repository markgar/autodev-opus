import { RestError } from "@azure/storage-blob";
import { blobServiceClient } from "../azure/blobClient.js";
import { sampleSpecsContainerName } from "../config.js";
const MAX_SPECS = 1000;

let blobAvailable = true;

export function setBlobAvailable(available: boolean): void {
  blobAvailable = available;
}

function getContainerClient() {
  return blobServiceClient.getContainerClient(sampleSpecsContainerName);
}

export class SpecNotFoundError extends Error {
  constructor(name: string) {
    super(`Spec "${name}" not found`);
    this.name = "SpecNotFoundError";
  }
}

/** Validates a spec filename: alphanumeric start, simple chars, ends with .md, max 255 chars. */
export function isValidSpecName(name: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,251}\.md$/.test(name) && !name.includes("..");
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof RestError && error.statusCode === 404;
}

export interface SampleSpecEntry {
  name: string;
  size: number;
  lastModified: string;
}

// --- In-memory fallback store for when Azure Blob Storage is unavailable ---

const memoryStore = new Map<string, { content: string; lastModified: string }>();

function memoryListSpecs(): SampleSpecEntry[] {
  const specs: SampleSpecEntry[] = [];
  for (const [name, entry] of memoryStore) {
    specs.push({
      name,
      size: Buffer.byteLength(entry.content),
      lastModified: entry.lastModified,
    });
  }
  return specs;
}

function memoryGetSpecContent(name: string): string {
  const entry = memoryStore.get(name);
  if (!entry) throw new SpecNotFoundError(name);
  return entry.content;
}

function memoryUploadSpec(name: string, content: string): void {
  memoryStore.set(name, { content, lastModified: new Date().toISOString() });
}

function memoryDeleteSpec(name: string): void {
  if (!memoryStore.delete(name)) throw new SpecNotFoundError(name);
}

// --- Public API ---

export async function listSpecs(): Promise<SampleSpecEntry[]> {
  if (!blobAvailable) return memoryListSpecs();

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
  if (!blobAvailable) return memoryGetSpecContent(name);

  const container = getContainerClient();
  const blobClient = container.getBlobClient(name);

  let response;
  try {
    response = await blobClient.download(0);
  } catch (error) {
    if (isNotFoundError(error)) throw new SpecNotFoundError(name);
    throw error;
  }

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
  if (!blobAvailable) {
    memoryUploadSpec(name, content);
    return;
  }

  const container = getContainerClient();
  const blockBlobClient = container.getBlockBlobClient(name);

  await blockBlobClient.upload(content, Buffer.byteLength(content), {
    blobHTTPHeaders: { blobContentType: "text/markdown" },
  });
}

export async function deleteSpec(name: string): Promise<void> {
  if (!blobAvailable) {
    memoryDeleteSpec(name);
    return;
  }

  const container = getContainerClient();
  const blobClient = container.getBlobClient(name);

  try {
    await blobClient.delete();
  } catch (error) {
    if (isNotFoundError(error)) throw new SpecNotFoundError(name);
    throw error;
  }
}
