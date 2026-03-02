import { cosmosClient } from "./cosmosClient.js";
import { cosmosDatabaseName, cosmosContainerName } from "../config.js";

async function initCosmos(): Promise<void> {
  const { database } = await cosmosClient.databases.createIfNotExists({
    id: cosmosDatabaseName,
  });

  await database.containers.createIfNotExists({
    id: cosmosContainerName,
    partitionKey: { paths: ["/organizationId"] },
  });

  console.log(`Cosmos DB initialized: database=${cosmosDatabaseName}, container=${cosmosContainerName}`);
}

export { initCosmos };
