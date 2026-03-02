# Milestone 04a — Projects API & Server Cleanup

## Milestone: Projects API and server cleanup

> **Validates:** `npm run build` succeeds. `npm test` passes. `GET /api/projects` returns HTTP 200 with a JSON array (may be empty if no Cosmos data). `GET /api/projects/nonexistent-id` returns HTTP 404 with `{ "message": "Project not found" }`.

> **Reference files:** `src/server/routes/health.ts` (route pattern with Router), `src/server/azure/cosmosClient.ts` (Cosmos client import), `src/server/app.ts` (router registration with `/api` prefix).

## Tasks

- [ ] Define Project TypeScript interface at src/server/models/project.ts — export a `Project` interface with fields: `id` (string), `organizationId` (string), `type` (string literal `"project"`), `name` (string), `specName` (string), `createdAt` (string, ISO 8601 datetime), `latestRunStatus` (`"pending" | "running" | "succeeded" | "failed" | null`), `runCount` (number)
- [ ] Create projects service at src/server/services/projectsService.ts — import `cosmosClient` from `../azure/cosmosClient.js`, export async function `listProjects(): Promise<Project[]>` that gets the `autodev` database and `items` container, runs `SELECT * FROM c WHERE c.organizationId = @orgId AND c.type = "project" ORDER BY c.createdAt DESC` with parameter `@orgId = "default"`, and returns `resources` as `Project[]`; export async function `getProjectById(id: string): Promise<Project | null>` that calls `container.item(id, "default").read()`, returns the resource as `Project`, or catches a 404 status code and returns `null`
- [ ] Create projects router at src/server/routes/projects.ts — create an Express `Router`, add `GET /projects` handler that calls `listProjects()` and responds with 200 and the array, add `GET /projects/:id` handler that calls `getProjectById(req.params.id)` and responds with 200 and the project or 404 with `{ "message": "Project not found" }`, wrap each handler body in try/catch returning 500 with `{ "message": "Internal server error" }` on unexpected failures
- [ ] Register projects router in src/server/app.ts — import `projectsRouter` from `./routes/projects.js`, add `app.use("/api", projectsRouter)` after the existing `app.use("/api", healthRouter)` line (before the API 404 catch-all)
- [ ] Clean up duplicate test files and fix test assertions — delete src/server/__tests__/app-static-config.test.ts entirely (duplicates static-serving.test.ts), remove the duplicate "exports an Express application with standard methods" test from app-module.test.ts (already in app.test.ts), remove the duplicate "registers a GET method on /health path" test from health-behavior.test.ts (already in health.test.ts), add missing `expect(statusCode).toBe(200)` assertion in the remaining health-behavior.test.ts test (fixes findings #41, #42, #43)
- [ ] Validate STAMP_ID in src/server/config.ts — change `??` to `||` so empty string falls back to default `"qqq"`, add a validation check that `stampId` matches `/^[a-z0-9]+$/` and throw a descriptive Error like `Invalid STAMP_ID: must be non-empty lowercase alphanumeric` if it does not (fixes finding #44)
- [ ] Remove unused supertest devDependency — run `npm uninstall supertest @types/supertest` to remove these packages since no test file imports supertest (fixes finding #45)
