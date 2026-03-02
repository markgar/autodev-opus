## Milestone: API hardening — validation, blob init, and error handling

> **Validates:**
> - `GET /api/sample-specs/../etc/passwd` returns 400.
> - `POST /api/sample-specs` with name containing `..` returns 400.
> - `DELETE /api/sample-specs/nonexistent.md` returns 404 (not 500).
> - `GET /api/sample-specs/nonexistent.md` returns 404 (not 500).
> - `GET /api/health` returns 200.

> **Reference files:**
> - Route: `src/server/routes/sampleSpecs.ts`
> - Service: `src/server/services/sampleSpecs.ts`
> - Azure blob client: `src/server/azure/blobClient.ts`
> - Server startup: `src/server/index.ts`

### Cleanup — open finding fixes

- [ ] Add `isValidSpecName` validation in `src/server/routes/sampleSpecs.ts` — function checks name matches `/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,250}\.md$/` and does not contain `..`, apply to POST handler (replace current `endsWith` check), add validation guard to GET `/sample-specs/:name` and DELETE `/sample-specs/:name` returning 400 for invalid names (fixes #86)
- [ ] Add `src/server/azure/initBlob.ts` — export `initBlobContainers(): Promise<void>` that calls `blobServiceClient.getContainerClient("sample-specs").createIfNotExists()` with a console.log on success, call it in `src/server/index.ts` alongside `initCosmos()` wrapped in try/catch with console.warn on failure (fixes #87)
- [ ] Improve sampleSpecs error handling — in `src/server/routes/sampleSpecs.ts` GET `/:name` and DELETE `/:name` handlers, replace `message.includes("BlobNotFound")` string matching with structured check on the caught error: inspect `(error as any).statusCode === 404` or `(error as any).code === "BlobNotFound"` before falling back to 500, update the service functions in `src/server/services/sampleSpecs.ts` to re-throw the original Azure SDK error instead of wrapping it in `new Error()` for `getSpecContent` and `deleteSpec` (fixes #88)
- [ ] Add `MAX_SPECS = 1000` constant in `src/server/services/sampleSpecs.ts` and break out of the `listBlobsFlat()` iteration loop in `listSpecs()` once `specs.length >= MAX_SPECS` (fixes #89)
