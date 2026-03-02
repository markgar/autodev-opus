# Milestone 02a — Azure SDK & Config Setup

## Milestone: Bug fixes, Azure SDK installation, and stamp configuration

> **Validates:** `npm run build` succeeds without errors. `npm test` passes all existing tests. `GET /api/health` still returns HTTP 200 `{ "status": "ok" }`. `GET /api/nonexistent` returns HTTP 404 with JSON `{ "message": "Not found" }` (not HTML).

> **Reference files:** `src/server/index.ts` (server entry point), `src/server/app.ts` (Express app setup with route registration and static serving), `src/server/routes/health.ts` (route handler pattern), `package.json` (dependencies and scripts), `src/client/vitest.config.ts` (client test config with alias).

## Tasks

- [x] Fix finding #17: re-add @types/node as a direct devDependency (`npm install --save-dev @types/node`)
- [x] Fix finding #18: add an API 404 handler in src/server/app.ts — register `app.use("/api", (_req, res) => { res.status(404).json({ message: "Not found" }); })` before the SPA catch-all route so unknown `/api/*` paths return JSON 404 instead of index.html
- [x] Fix finding #20: fix the `@` path alias in src/client/vitest.config.ts — change `path.resolve(__dirname, "src/client")` to just `__dirname` since the config file already lives at src/client/
- [ ] Install Azure SDKs: `npm install @azure/storage-blob @azure/cosmos @azure/identity`
- [ ] Create stamp config module at src/server/config.ts — read `STAMP_ID` from `process.env` (default `"qqq"`), export `stampId` string, `storageAccountName` as `stautodev${stampId}`, and `cosmosAccountName` as `cosmos-autodev-${stampId}`
