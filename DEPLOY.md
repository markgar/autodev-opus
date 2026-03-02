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
| `STAMP_ID` | `qqq` | 1-16 lowercase alphanumeric stamp ID. Derives storage account name (`stautodev{stampId}`) and Cosmos account (`cosmos-autodev-{stampId}`) |

## Port Mappings

- Host `8713` → Container `3000` (main app)
- The server listens on port 3000 by default (configurable via `PORT` env var)

## Startup Sequence

1. `docker compose build` then `docker compose up -d`
2. On startup, the server calls `initCosmos()` which attempts to connect to Azure Cosmos DB. Without Azure credentials, it logs a warning and continues (non-fatal).
3. App serves requests within ~2 seconds. Health endpoint returns 503 (degraded) without Azure but SPA and API routes are functional.

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
# Copy whichever spec files you need:
docker cp e2e/milestone-07b.spec.ts autodev-opus-playwright-1:/repo/e2e/milestone-07b.spec.ts
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
9. **Azure SDKs in production image:** `@azure/storage-blob`, `@azure/cosmos`, and `@azure/identity` are production dependencies, so they are included in the production Docker image (not pruned by `--omit=dev`).
10. **API 404 handler:** Unknown `/api/*` paths return `{ "message": "Not found" }` (JSON 404), not the SPA's index.html. The handler is registered after named API routes but before the SPA catch-all in `app.ts`.
11. **Cosmos DB init is non-fatal:** `src/server/index.ts` catches Cosmos DB initialization errors and logs a warning instead of exiting. This allows the app to start in environments without Azure connectivity (Docker, CI).
12. **react-router-dom required:** The client depends on `react-router-dom` (added in milestone 03). Run `npm install` before running client tests locally — the Docker build handles this via `npm ci`.
13. **SPA routing:** All client routes (/, /projects/new, /projects/:id, /admin/sample-specs) are served by the Express catch-all `/{*splat}` handler which returns index.html. React Router handles client-side navigation.
14. **Sample specs CRUD requires Azure Blob Storage:** The `/api/sample-specs` endpoints (GET list, GET by name, POST, DELETE) all require Azure Blob Storage connectivity. Set `AZURE_STORAGE_CONNECTION_STRING` to use Azurite for local development. Without either a connection string or Azure credentials (`DefaultAzureCredential`), the endpoints return 500.
15. **STAMP_ID validation:** `config.ts` validates STAMP_ID with `/^[a-z0-9]{1,16}$/`. Invalid values cause a startup crash. Default is `qqq`.
16. **Sample specs route registration:** `sampleSpecsRouter` is registered in `app.ts` with `app.use("/api", sampleSpecsRouter)` after healthRouter and before the API 404 handler. Routes: GET/POST `/sample-specs`, GET/DELETE `/sample-specs/:name`.
17. **Sample specs API without Azure:** `GET /api/sample-specs` returns HTTP 500 when Azure Blob Storage is unavailable. The SampleSpecsPage shows an error state with a "Retry" button in this case. The "No sample specs uploaded yet" empty state only appears when the API returns 200 with an empty array.
18. **Toast duplicate text:** The SampleSpecsPage shows both an inline error message and a Sonner toast for "Failed to load specs". Playwright tests should use specific locators (e.g., Retry button) to avoid strict mode violations from duplicate text matches.
19. **Strict mode text collisions:** "Projects" appears both in the sidebar group label and the DashboardPage heading. "Sample Specs" appears in the sidebar link and the page heading. Playwright tests must use `getByRole('heading', ...)` or scope to `[data-sidebar="sidebar"]` to avoid strict mode violations.
20. **ViewSpecDialog AbortController:** The ViewSpecDialog useEffect passes `{ signal: controller.signal }` to fetch. Tests asserting on fetch calls must expect `expect.objectContaining({ signal: expect.any(AbortSignal) })` as the second argument.
21. **npm install needed for local tests:** After checking out new code, run `npm install` (not just `npm ci`) to ensure all dependencies in package.json are installed — e.g., `@radix-ui/react-alert-dialog` was added but may not exist in local node_modules from a prior checkout.
22. **Project model:** `src/server/models/project.ts` exports the `Project` interface with fields: id, organizationId, type ("project"), name, specName, createdAt, latestRunStatus, runCount. Used by projectsService.ts for Cosmos DB CRUD and by projects.ts routes.
23. **Playwright container restart:** If the playwright container dies (OOM or timeout during first test run), restart with `docker compose up -d playwright`, then re-copy test files before retrying.
24. **Projects API requires Cosmos DB:** `GET /api/projects` returns 500 without Cosmos DB (not 200 with `[]`). `GET /api/projects/:id` returns 500 (not 404). The route handler catches the service error and returns `{ "message": "Internal server error" }`. Consistent with sample specs behavior.
25. **Projects routes registered correctly:** `projectsRouter` is registered in `app.ts` with `app.use("/api", projectsRouter)` after sampleSpecsRouter. Routes: `GET /projects` (list), `GET /projects/:id` (get by id), `GET /projects/:id/logs` (get logs). All use JSON error envelope on failure.
26. **NewProjectPage is fully functional:** `NewProjectPage` at `/projects/new` has a complete form with Zod validation (react-hook-form + zodResolver), a spec picker that loads from `GET /api/sample-specs`, and submits via `POST /api/projects`. The "Create Project" button is disabled when no specs are available. On success, navigates to `/projects/:id`. DashboardPage and ProjectDetailPage are functional with data fetching.
27. **Playwright test file naming:** E2E test files follow `e2e/milestone-{id}.spec.ts` naming pattern. Copy files into playwright container with `docker cp` due to DinD volume mount limitations.
28. **ProjectDetailPage requires mocked API for Playwright:** Without Azure, project detail page always shows error state. Use `page.route()` to mock both `/api/projects/:id` and `/api/projects/:id/logs` to test full UI behavior (heading, log viewer, pause/resume, back link).
29. **LogViewer states:** The LogViewer component has distinct states: loading (spinner), empty ("No logs yet"), error (red text + retry button), and populated (log lines with pause/resume button). The pause/resume button only appears when log lines are present.
30. **Pause button text collision:** Project names containing "Pause" or "Resume" will cause Playwright strict mode violations with `getByText`. Always use `getByRole('button', { name: 'Pause' })` for the polling toggle.
31. **POST /api/projects route:** Validates `name` (non-empty string, max 100 chars) and `specName` (non-empty string, must pass `isValidSpecName` format check) before calling Cosmos DB. Returns 400 with `{ "message": "..." }` on validation failure, 201 with full project JSON on success, 500 on Cosmos/Blob failure.
32. **Form dependencies:** `react-hook-form`, `@hookform/resolvers`, and `zod` are production dependencies. shadcn/ui `Form`, `Select`, and `Label` components are in `src/client/components/ui/`.
33. **Spec picker behavior:** The spec picker on `/projects/new` fetches from `GET /api/sample-specs`, strips `.md` extension for display, and appends `.md` back before POSTing. Shows "Loading specs..." while fetching, "No specs available — upload specs in Admin first" when empty, and disables both the select and submit button when no specs exist.
34. **Blob container init at startup:** `src/server/index.ts` calls `initBlobContainers()` alongside `initCosmos()` at startup, each wrapped in try/catch. Both log prominent `⚠️` warnings on failure. The app continues running even if both fail.
35. **Spec name validation:** Routes validate spec names with `isValidSpecName()` before any CRUD operation. Invalid names return 400 `{ message: "Invalid spec name" }`. Valid pattern: `/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,250}\.md$/` and no `..` sequences.
36. **Spec listing bounded:** `listSpecs()` has a `MAX_SPECS = 1000` limit — iteration stops once that many specs are collected.
37. **RestError propagation:** `sampleSpecs.ts` service uses `RestError` `statusCode` checking (not string matching) for 404 detection. Azure SDK errors propagate correctly.
38. **Responsive project detail page:** `ProjectDetailPage` uses `text-xl md:text-2xl` for heading, `text-xs md:text-sm` for date, and wraps LogViewer in `h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)]`. LogViewer uses `text-xs md:text-sm` and `h-full` for responsive sizing.
39. **SpecNotFoundError structured handling:** `getSpecContent` and `deleteSpec` now catch Azure `RestError` with statusCode 404 and throw `SpecNotFoundError`. Routes catch this and return HTTP 404 (not 500). Requires Azure connectivity to test.
40. **In-memory fallback for all services:** When Azure init fails at startup, `index.ts` sets availability flags on all service modules (`setBlobAvailable`, `setCosmosAvailable`, `setLogsBlobAvailable`, `setContainerBlobAvailable`). Each service checks its flag and routes to in-memory storage or skips the operation.
