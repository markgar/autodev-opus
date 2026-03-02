# Milestone 02b — Azure Clients & Cosmos DB Initialization

## Milestone: Shared Azure client modules and Cosmos DB initialization

> **Validates:** `npm run build` succeeds without errors. `npm start` starts the server (it will fail to connect to Azure in CI — that is expected). The server entry point (`src/server/index.ts`) imports and calls the Cosmos initialization function. `npm test` passes all existing tests.

> **Reference files:** `src/server/index.ts` (server entry point), `src/server/config.ts` (stamp configuration), `package.json` (dependencies and scripts).

## Tasks

- [x] Create Azure credential module at src/server/azure/credential.ts — import `DefaultAzureCredential` from `@azure/identity`, export a single shared instance created with `new DefaultAzureCredential()`
- [x] Create blob storage client module at src/server/azure/blobClient.ts — import `BlobServiceClient` from `@azure/storage-blob`, import the credential and `storageAccountName` from the config and credential modules, export a `BlobServiceClient` initialized with URL `https://${storageAccountName}.blob.core.windows.net` and the shared credential
- [x] Create Cosmos DB client module at src/server/azure/cosmosClient.ts — import `CosmosClient` from `@azure/cosmos`, import the credential and `cosmosAccountName` from the config and credential modules, export a `CosmosClient` initialized with endpoint `https://${cosmosAccountName}.documents.azure.com:443/` and the shared credential via `aadCredentials` option
- [ ] Create Cosmos DB initialization function at src/server/azure/initCosmos.ts — export an async `initCosmos()` function that calls `cosmosClient.databases.createIfNotExists({ id: "autodev" })` then `database.containers.createIfNotExists({ id: "items", partitionKey: { paths: ["/organizationId"] } })`, log success message to console on completion
- [ ] Integrate Cosmos DB initialization into server startup in src/server/index.ts — call `initCosmos()` with await before `app.listen()`, wrap in try/catch that logs the error and exits the process with code 1 on failure (the app cannot function without Cosmos DB)
