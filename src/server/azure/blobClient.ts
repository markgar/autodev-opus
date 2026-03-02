import { BlobServiceClient } from "@azure/storage-blob";
import { credential } from "./credential.js";
import { storageAccountName } from "../config.js";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient = connectionString
  ? BlobServiceClient.fromConnectionString(connectionString)
  : new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      credential,
    );

export { blobServiceClient };
