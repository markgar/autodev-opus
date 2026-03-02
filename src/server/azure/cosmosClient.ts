import { CosmosClient } from "@azure/cosmos";
import { credential } from "./credential.js";
import { cosmosAccountName } from "../config.js";

const cosmosClient = new CosmosClient({
  endpoint: `https://${cosmosAccountName}.documents.azure.com:443/`,
  aadCredentials: credential,
});

export { cosmosClient };
