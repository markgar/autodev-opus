# AutoDev — Technical Spec

## What This Is

AutoDev is a web portal for managing AI-driven software projects. Users create projects backed by Azure Blob Storage containers, view build logs streamed from those containers, and manage a library of sample spec files. It is the front-end for the [buildteam](https://github.com/markgar/buildteam) multi-agent build system.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Backend:** Express (serves API routes under `/api/*` and the static SPA)
- **Frontend:** React SPA built with Vite, TypeScript
- **UI:** shadcn/ui (Radix primitives) + Tailwind CSS + Lucide icons + Sonner toasts
- **Azure SDKs:** `@azure/storage-blob`, `@azure/cosmos`, `@azure/identity`
- **Single container deployment:** One Docker image serves both the API and the SPA

## Architecture

### Layers

1. **Express API** — `/api/*` routes. Thin controllers that call service modules.
2. **Services** — Business logic for projects, sample specs, and log retrieval.
3. **Azure clients** — Initialized once at startup using `DefaultAzureCredential`. Resource names derived from `STAMP_ID` env var (`stautodev{stampId}`, `cosmos-autodev-{stampId}`).
4. **React SPA** — Vite-built static files served by Express. Client-side routing.

### Project Structure

```
src/
  server/          # Express app, routes, services, Azure client init
  client/          # React app (pages, components, hooks)
```

### Dependency Rules

- Server code never imports from `client/`. Client code never imports from `server/`.
- Azure SDK usage is confined to `server/`. The frontend only talks to `/api/*`.

## Cross-Cutting Concerns

- **Authentication to Azure:** `DefaultAzureCredential` everywhere — managed identity in prod, `az login` in dev.
- **Multi-tenancy:** All Cosmos documents include `organizationId` (partition key). Hardcoded to `"default"` for now. Every query filters on it to ensure single-partition reads.
- **Data model:** Single Cosmos container (`items`) with a `type` discriminator. See REQUIREMENTS.md §3.6.
- **Error handling:** API routes return structured JSON errors. Frontend shows toast notifications (Sonner) for failures and inline error states with retry buttons.
- **Responsive design:** Single breakpoint at `md:` (768px). Sidebar collapses to overlay on mobile. Tables become card layouts.

## Acceptance Criteria

- [ ] App shell renders with sidebar navigation (Projects → Dashboard, Admin → Sample Specs). Sidebar collapses on mobile.
- [ ] Dashboard lists projects from Cosmos DB with name and created date. Supports empty, loading, and error states.
- [ ] New Project form creates a Cosmos record and a blob container. Requires name and sample spec selection.
- [ ] Project detail page displays a polling log viewer with auto-scroll and pause/resume.
- [ ] Sample Specs admin page lists, uploads, views, downloads, and deletes markdown files in blob storage.
- [ ] All pages are responsive — usable at both desktop and mobile widths.
- [ ] App starts cleanly with `npm run dev` and builds with `npm run build`.
