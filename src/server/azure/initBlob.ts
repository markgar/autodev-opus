import { blobServiceClient } from "./blobClient.js";

const BLOB_CONTAINER_NAME = "sample-specs";

async function initBlobContainers(): Promise<void> {
  const container = blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);
  await container.createIfNotExists();
  console.log(`Blob container initialized: ${BLOB_CONTAINER_NAME}`);
}

export { initBlobContainers };
