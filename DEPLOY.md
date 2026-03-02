# DEPLOY.md — Deployment Guide

## Dockerfile

- **Location:** `Dockerfile` in repo root
- **Multi-stage build:** Stage 1 (`build`) installs all deps and runs `npm run build` (tsc + vite). Stage 2 installs production deps only and copies `dist/` from stage 1.
- **Base image:** `node:22-alpine`
- **No build args required.**

## Docker Compose

- **File:** `docker-compose.yml` in repo root
- **Services:**
  - `app` — the Express server serving both API and SPA
  - `playwright` — for running e2e UI tests (mcr.microsoft.com/playwright:v1.52.0-noble)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the Express server listens on inside the container |
| `NODE_ENV` | — | Set to `production` for static file serving; `development` disables SPA serving |
<<<<<<< HEAD
| `STAMP_ID` | `qqq` | 3-letter stamp ID. Derives storage account name (`stautodev{stampId}`) and Cosmos account (`cosmos-autodev-{stampId}`) |
=======
| `STAMP_ID` | `qqq` | 3-letter stamp ID. Derives storage account (`stautodev{stampId}`) and Cosmos account (`cosmos-autodev-{stampId}`) |
>>>>>>> 4111844 ([validator] Fix health endpoint tests for Azure-aware behavior and update DEPLOY.md)

## Port Mappings

- Host `8713` → Container `3000` (main app)
- The server listens on port 3000 by default (configurable via `PORT` env var)

## Startup Sequence

1. `docker compose build` then `docker compose up -d`
2. On startup, the server calls `initCosmos()` which connects to Azure Cosmos DB to create the `autodev` database and `items` container (idempotent `createIfNotExists`).
3. **Without Azure credentials, the server will exit with code 1.** This is expected in CI/local environments without Azure access. The app cannot function without Cosmos DB.
4. With valid Azure credentials (managed identity, az login, or env vars), the server starts and listens on the configured port.

## Health Check

- **Endpoint:** `GET /api/health`
- **Healthy response:** HTTP 200 with JSON body `{"status":"ok","checks":{"cosmosDb":"connected","blobStorage":"connected"}}`
- **Degraded response:** HTTP 503 with JSON body `{"status":"degraded","checks":{"cosmosDb":"unavailable","blobStorage":"unavailable"}}`
- The health endpoint checks actual connectivity to Cosmos DB and Blob Storage. Without Azure credentials, it returns 503.

## Running Playwright E2E Tests

Due to Docker-in-Docker volume mount limitations, files must be copied into the playwright container:

```bash
export COMPOSE_PROJECT_NAME=autodev-opus
docker compose up -d
docker compose exec playwright sh -c 'mkdir -p /repo/e2e'
docker cp e2e/package.json autodev-opus-playwright-1:/repo/e2e/package.json
docker cp e2e/playwright.config.ts autodev-opus-playwright-1:/repo/e2e/playwright.config.ts
docker cp e2e/ui-validation.spec.ts autodev-opus-playwright-1:/repo/e2e/ui-validation.spec.ts
docker cp e2e/milestone-01b.spec.ts autodev-opus-playwright-1:/repo/e2e/milestone-01b.spec.ts
docker compose exec playwright sh -c 'cd /repo/e2e && npm install && npx playwright test --reporter=list'
```

## Running Unit Tests

Unit tests require dev dependencies and a prior build (for build-output tests). Run locally or in a dev container:

```bash
npm ci
npm run build
npm test
```

**Note:** `npm test` cannot run inside the production Docker container because dev dependencies (vitest, testing-library) are pruned. Run tests in the build environment.

## Known Gotchas

1. **Express v5 catch-all routes:** Express v5 uses path-to-regexp v8. Catch-all routes must use `/{*splat}` syntax, not `*`. Named parameters are required.
2. **Playwright version pinning:** The `e2e/package.json` must pin `@playwright/test` to exactly `1.52.0` (no caret) to match the Docker image `mcr.microsoft.com/playwright:v1.52.0-noble`. A `^1.52.0` spec resolves to a newer version that requires a different browser binary path.
3. **Docker-in-Docker volume mounts:** The `.:/repo` volume mount in docker-compose.yml may not reflect the agent's filesystem in DinD environments. Use `docker cp` to copy files into the container as a workaround.
4. **SPA static serving:** The server only serves static files when `NODE_ENV` is NOT `development`. Make sure `NODE_ENV=production` is set in the container.
5. **.dockerignore:** Excludes `node_modules`, `dist`, `.git`, `e2e`, and `*.md` to keep the build context small.
6. **Server tsconfig excludes tests:** `src/server/tsconfig.json` must have `"exclude": ["./**/__tests__/**"]` to prevent test files from being compiled during `tsc` production build. Test files may import modules differently than the app entry point.
7. **App code split:** The Express app is defined in `src/server/app.ts` (default export), while `src/server/index.ts` only imports the app, configures the port, and calls `listen()`. Tests that inspect the Express app should import from `app.ts`, not `index.ts`.
8. **build-output tests need dist/:** The `build-output.test.ts` server tests check for files in `dist/`. Run `npm run build` before `npm test` or these tests will fail.
<<<<<<< HEAD
9. **Azure SDKs in production image:** `@azure/storage-blob`, `@azure/cosmos`, and `@azure/identity` are production dependencies, so they are included in the production Docker image (not pruned by `--omit=dev`).
10. **API 404 handler:** Unknown `/api/*` paths return `{ "message": "Not found" }` (JSON 404), not the SPA's index.html. The handler is registered after named API routes but before the SPA catch-all in `app.ts`.
=======
9. **Cosmos DB required for startup:** Since milestone 02b, the server calls `initCosmos()` before `app.listen()`. Without Azure credentials, the server exits with code 1. Tests that need the Express app should import from `app.ts` (no side effects), not `index.ts` (which calls initCosmos and listen).
10. **Health endpoint checks Azure:** The health endpoint at `/api/health` now performs real connectivity checks against Cosmos DB and Blob Storage. It returns 503 (degraded) when Azure services are unreachable, not 200. Tests should accept both 200 and 503 status codes.
>>>>>>> 4111844 ([validator] Fix health endpoint tests for Azure-aware behavior and update DEPLOY.md)
