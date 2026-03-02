import { blobServiceClient } from "./blobClient.js";
import { sampleSpecsContainerName } from "../config.js";

async function initBlobContainers(): Promise<void> {
  const container = blobServiceClient.getContainerClient(sampleSpecsContainerName);
  await container.createIfNotExists();
  console.log(`Blob container initialized: ${sampleSpecsContainerName}`);
}

export { initBlobContainers };
