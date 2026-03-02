import { BlobServiceClient } from "@azure/storage-blob";
import { credential } from "./credential.js";
import { storageAccountName } from "../config.js";

const blobServiceClient = new BlobServiceClient(
  `https://${storageAccountName}.blob.core.windows.net`,
  credential,
);

export { blobServiceClient };
