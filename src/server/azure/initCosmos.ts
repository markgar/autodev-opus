import { cosmosClient } from "./cosmosClient.js";

async function initCosmos(): Promise<void> {
  const { database } = await cosmosClient.databases.createIfNotExists({
    id: "autodev",
  });

  await database.containers.createIfNotExists({
    id: "items",
    partitionKey: { paths: ["/organizationId"] },
  });

  console.log("Cosmos DB initialized: database=autodev, container=items");
}

export { initCosmos };
