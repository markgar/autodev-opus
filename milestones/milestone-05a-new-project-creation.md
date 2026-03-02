## Milestone: New project creation — API and UI

> **Validates:**
> - `POST /api/projects` with JSON body `{ "name": "Test Project", "specName": "some-spec.md" }` returns 201 with a JSON body containing `id`, `name`, `specName`, `createdAt`, `organizationId`, and `type: "project"`.
> - `POST /api/projects` with empty body or missing `name` returns 400 with a JSON `{ "message": "..." }` error.
> - `POST /api/projects` with a name longer than 100 characters returns 400.
> - `POST /api/projects` with missing `specName` returns 400.
> - `GET /api/projects` returns the newly created project in the list.
> - Page at `/projects/new` renders with a "Project Name" input field that is auto-focused, a "Sample Spec" select dropdown, a "Create Project" submit button, and a "Cancel" button.
> - The sample spec select loads options from `GET /api/sample-specs` and displays filenames without the `.md` extension.
> - Submitting the form with valid data navigates to `/projects/:id`.
> - `GET /api/health` returns 200.

> **Reference files:**
> - Entity: `src/server/models/project.ts`
> - Service: `src/server/services/projectsService.ts`
> - Route: `src/server/routes/projects.ts`
> - Page (pattern): `src/client/pages/SampleSpecsPage.tsx`
> - App routing: `src/client/App.tsx`
> - Server app: `src/server/app.ts`
> - Azure blob client: `src/server/azure/blobClient.ts`
> - Server startup: `src/server/index.ts`

### Backend

- [x] Add `createProject` function to `src/server/services/projectsService.ts` — accepts `name: string` and `specName: string`, generates a UUID `id` (use `crypto.randomUUID()`), creates a Cosmos DB document with fields `{ id, organizationId: "default", type: "project", name, specName, createdAt: new Date().toISOString(), latestRunStatus: null, runCount: 0 }`, returns the created `Project`
- [x] Create `src/server/services/projectContainers.ts` — export `ensureProjectContainer(projectId: string): Promise<void>` that calls `blobServiceClient.getContainerClient(projectId).createIfNotExists()`, wraps errors with a descriptive message
- [x] Add `POST /api/projects` route handler in `src/server/routes/projects.ts` — reads `name` and `specName` from `req.body`, validates name is a non-empty string with max 100 characters, validates specName is a non-empty string, returns 400 with `{ message }` on validation failure, calls `createProject(name, specName)` then `ensureProjectContainer(project.id)`, returns 201 with the created project JSON

### Frontend — dependencies and components

- [x] Install form dependencies: `npm install react-hook-form @hookform/resolvers zod`
- [x] Add shadcn/ui Select component (`npx shadcn@latest add select`), Label component (`npx shadcn@latest add label`), and Form component (`npx shadcn@latest add form`) to `src/client/components/ui/`

### Frontend — New Project page

- [x] Build `src/client/pages/NewProjectPage.tsx` form UI — define Zod schema with `name` (string, min 1 "Project name is required", max 100 "Name must be 100 characters or less") and `specName` (string, min 1 "Please select a sample spec"), initialize React Hook Form with zodResolver, render a Form with: "Project Name" FormField using Input (placeholder "My awesome app", autoFocus), "Sample Spec" FormField using Select that loads specs from `GET /api/sample-specs` on mount (display filenames without `.md` extension, show "Loading specs..." disabled placeholder while loading, show "No specs available — upload specs in Admin first" and disable submit if empty), inline FormMessage errors below each field
- [ ] Add submit handler and cancel button to `NewProjectPage.tsx` — on valid submit: set submitting state, POST to `/api/projects` with `{ name, specName }` (append `.md` back to specName before sending), show spinner on "Create Project" button while submitting, on 201 response navigate to `/projects/${data.id}` using `useNavigate()`, on error show `toast.error(message)`, add "Cancel" button (variant "outline") that navigates to `/` via `useNavigate()`
