# Milestone 02 — Azure Client Infrastructure

## Milestone: Azure SDK installation, shared client modules, and Cosmos DB initialization

> **Validates:** `npm run build` succeeds without errors. `npm start` starts the server (it will fail to connect to Azure in CI — that is expected). The server entry point (`src/server/index.ts`) imports and calls the Cosmos initialization function. `GET /api/health` still returns HTTP 200 `{ "status": "ok" }`. `GET /api/nonexistent` returns HTTP 404 with JSON `{ "message": "Not found" }` (not HTML). `npm test` passes all existing tests.

> **Reference files:** `src/server/index.ts` (server entry point), `src/server/app.ts` (Express app setup with route registration and static serving), `src/server/routes/health.ts` (route handler pattern), `package.json` (dependencies and scripts), `src/client/vitest.config.ts` (client test config with alias).

## Tasks

- [ ] Fix finding #17: re-add @types/node as a direct devDependency (`npm install --save-dev @types/node`)
- [ ] Fix finding #18: add an API 404 handler in src/server/app.ts — register `app.use("/api", (_req, res) => { res.status(404).json({ message: "Not found" }); })` before the SPA catch-all route so unknown `/api/*` paths return JSON 404 instead of index.html
- [ ] Fix finding #20: fix the `@` path alias in src/client/vitest.config.ts — change `path.resolve(__dirname, "src/client")` to just `__dirname` since the config file already lives at src/client/
- [ ] Install Azure SDKs: `npm install @azure/storage-blob @azure/cosmos @azure/identity`
- [ ] Create stamp config module at src/server/config.ts — read `STAMP_ID` from `process.env` (default `"qqq"`), export `stampId` string, `storageAccountName` as `stautodev${stampId}`, and `cosmosAccountName` as `cosmos-autodev-${stampId}`
- [ ] Create Azure credential module at src/server/azure/credential.ts — import `DefaultAzureCredential` from `@azure/identity`, export a single shared instance created with `new DefaultAzureCredential()`
- [ ] Create blob storage client module at src/server/azure/blobClient.ts — import `BlobServiceClient` from `@azure/storage-blob`, import the credential and `storageAccountName` from the config and credential modules, export a `BlobServiceClient` initialized with URL `https://${storageAccountName}.blob.core.windows.net` and the shared credential
- [ ] Create Cosmos DB client module at src/server/azure/cosmosClient.ts — import `CosmosClient` from `@azure/cosmos`, import the credential and `cosmosAccountName` from the config and credential modules, export a `CosmosClient` initialized with endpoint `https://${cosmosAccountName}.documents.azure.com:443/` and the shared credential via `aadCredentials` option
- [ ] Create Cosmos DB initialization function at src/server/azure/initCosmos.ts — export an async `initCosmos()` function that calls `cosmosClient.databases.createIfNotExists({ id: "autodev" })` then `database.containers.createIfNotExists({ id: "items", partitionKey: { paths: ["/organizationId"] } })`, log success message to console on completion
- [ ] Integrate Cosmos DB initialization into server startup in src/server/index.ts — call `initCosmos()` with await before `app.listen()`, wrap in try/catch that logs the error and exits the process with code 1 on failure (the app cannot function without Cosmos DB)
