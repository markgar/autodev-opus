# Milestone 06b — Responsive polish and review fixes

## Milestone: Responsive detail page layout and review-finding fixes

> **Validates:** The project detail page is responsive: on desktop the log viewer fills remaining viewport height, on mobile it is full-width with smaller font. Spec name validation rejects invalid names with 400. Blob containers are initialized at startup. Azure SDK `RestError` propagates correctly from sample spec operations. Spec listing is bounded. Cosmos DB init failure logs a clear warning. The app builds with `npm run build` and starts with `npm start`.

> **Reference files:** `src/client/pages/ProjectDetailPage.tsx` (detail page to add responsive layout), `src/client/components/LogViewer.tsx` (log viewer to adjust for mobile), `src/server/routes/sampleSpecs.ts` (spec routes to add validation), `src/server/services/sampleSpecs.ts` (spec service to fix error handling and add limit), `src/server/azure/blobClient.ts` (shared blob client for init), `src/server/index.ts` (startup to add blob init and improve Cosmos warning)

## Tasks

- [x] Add responsive layout to the project detail page: on desktop, the log viewer fills remaining viewport height using `h-[calc(100vh-12rem)]` (adjust for header); on mobile, log viewer is full-width with `text-xs` font size instead of `text-sm`, header stacks vertically with the back link, name, and date each on their own line — use Tailwind responsive `md:` prefix classes
- [x] Fix finding #86 — Add `isValidSpecName` validation function to `src/server/routes/sampleSpecs.ts`: validate name matches `/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,250}\.md$/` and does not contain `..`, apply to GET `:name`, POST (reject invalid name with 400), and DELETE `:name` routes (return 400 `{ message: "Invalid spec name" }` for invalid names)
- [x] Fix finding #87 — Create `src/server/azure/initBlob.ts` with an `initBlobContainers()` function that calls `blobServiceClient.getContainerClient("sample-specs").createIfNotExists()`, call it in `src/server/index.ts` alongside `initCosmos()` wrapped in a try/catch that logs a warning on failure
- [x] Fix finding #88 — Update `src/server/services/sampleSpecs.ts` to let Azure SDK `RestError` propagate from `getSpecContent` and `deleteSpec` instead of wrapping in plain `Error`, update `src/server/routes/sampleSpecs.ts` GET `:name` and DELETE `:name` catch blocks to check `(error as any).statusCode === 404` instead of string-matching `"BlobNotFound"`
- [x] Fix finding #89 — Add `MAX_SPECS = 1000` constant to `src/server/services/sampleSpecs.ts` and break the `listSpecs` iteration loop once `specs.length >= MAX_SPECS`
- [ ] Fix finding #90 — Update the Cosmos DB init catch block in `src/server/index.ts` to log a more prominent warning: `"⚠️  Cosmos DB initialization failed:"` followed by `"⚠️  Project CRUD endpoints will return 500 errors until Cosmos DB is available."`
