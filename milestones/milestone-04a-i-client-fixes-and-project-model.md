# Milestone 04a-i — Client fixes and Project model

## Milestone: Pre-flight fixes and Project data model

> **Validates:** `npm run build` succeeds. `npm test` passes all existing tests. `src/server/models/project.ts` exports the `Project` interface.

> **Reference files:** `src/client/components/ViewSpecDialog.tsx` (AbortController fix target), `src/client/components/DeleteSpecDialog.tsx` (dialog auto-close fix target), `src/server/config.ts` (exports `cosmosDatabaseName` and `cosmosContainerName`), `.github/copilot-instructions.md` (Key files documentation).

## Tasks

- [x] Fix finding #70: Update .github/copilot-instructions.md Key files section — add entry for `src/server/config.ts` noting it exports `cosmosDatabaseName` and `cosmosContainerName` constants in addition to stamp-derived names (these constants are already there but not documented as being used by services)
- [x] Fix finding #72: In src/client/components/ViewSpecDialog.tsx, add an AbortController to the useEffect that fetches spec content — create the controller at the top of the effect, pass `{ signal: controller.signal }` to the fetch call, return a cleanup function that calls `controller.abort()`, and guard the state setters (`setContent`, `setLoading`) to skip if the signal was aborted
- [x] Fix finding #73: In src/client/components/DeleteSpecDialog.tsx, replace AlertDialogAction with a plain Button (variant="destructive") so the dialog does NOT auto-close on click — the handleDelete function should call `onOpenChange(false)` explicitly only after the DELETE fetch completes successfully, ensuring the loading spinner is visible during the request
- [x] Create Project interface at src/server/models/project.ts — export interface `Project` with fields: `id` (string), `organizationId` (string), `type` (string literal "project"), `name` (string), `specName` (string), `createdAt` (string, ISO 8601), `latestRunStatus` (string | null, one of "pending" | "running" | "succeeded" | "failed" | null), `runCount` (number)
