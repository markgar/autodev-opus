# Project Requirements

> This document contains the project requirements as provided by the user.
> It may be updated with new requirements in later sessions.

# AutoDev — Requirements

## 1. Overview

AutoDev is a web portal where users describe the software they want, and the platform builds it for them autonomously. It is the front-end for [buildteam](https://github.com/markgar/buildteam) — a multi-agent development workflow that uses GitHub Copilot CLI agents to collaboratively produce working software.

---

## 2. What We're Building

Two things:

1. **Project management** — users create projects, each backed by a blob container where buildteam writes logs. The portal displays a dashboard of projects and a log viewer for each one. Builds happen externally (buildteam is run outside AutoDev for now); AutoDev just reads the logs.
2. **Sample spec admin** — an admin screen for managing the sample spec library (markdown files in blob storage) that users choose from when creating a project.

---

## 3. Functional Requirements

### 3.1 App Shell

- **FR-1:** The app is a single-page web application with a sidebar + main content layout.
- **FR-2:** The sidebar has a **Projects** section with a **Dashboard** menu item (the default/home page).
- **FR-3:** The sidebar has an **Admin** section with one menu item: **Sample Specs**.
- **FR-4:** The app shell is extensible — future pages (settings, users, etc.) will be added as new menu items without restructuring.

**Sidebar layout:**
- The sidebar shows the app name "AutoDev" at the top as a logo/heading.
- Navigation items are grouped under section headings ("Projects", "Admin"). Each item has a Lucide icon and a text label.
- The active page's nav item is visually highlighted.
- Use shadcn/ui's sidebar component (`SidebarProvider`, `Sidebar`, `SidebarContent`, etc.) if available, otherwise build from Radix primitives.

**Responsive behavior:**
- **Desktop (≥ 768px):** Sidebar is always visible on the left. Main content fills the remaining width.
- **Mobile (< 768px):** Sidebar is hidden by default. A hamburger menu button appears in a top bar. Tapping it opens the sidebar as a slide-over overlay. Tapping a nav item navigates and closes the sidebar. Tapping outside the sidebar closes it.
- All layouts use Tailwind responsive utilities (`md:` prefix). No hardcoded pixel widths anywhere — use `w-full`, `max-w-*`, and responsive classes.
- Content areas use `max-w-5xl mx-auto` (or similar) to center content and cap line length on very wide screens.

### 3.2 Dashboard

- **FR-5:** The dashboard is the home page. It lists all projects.
- **FR-6:** Each row shows the project name and created date.
- **FR-7:** Clicking a project navigates to its detail page.
- **FR-8:** A **"New Project"** button opens the new project form.

**Layout:**
- Page heading: "Projects" with a "New Project" button right-aligned on the same row.
- Below the heading: a table (or card list) of projects, sorted by `createdAt` descending (newest first).
- Table columns: **Name**, **Created** (formatted as relative time like "2 hours ago" or a readable date).
- Each row is clickable — the entire row navigates to `/projects/:id`.

**Responsive behavior:**
- **Desktop:** Renders as a table with columns.
- **Mobile:** Each project renders as a stacked card (name on top, date below). Cards are full-width and tappable.

**Empty state:** When there are no projects, show a centered message: "No projects yet" with a "Create your first project" button.

**Loading state:** Show a skeleton/shimmer placeholder while the project list is loading.

**Error state:** If the API call fails, show a toast error notification (Sonner) and display an inline "Failed to load projects" message with a "Retry" button.

### 3.3 New Project

- **FR-9:** The new project form has a **name** field and a **sample spec** picker.
- **FR-10:** The sample spec picker lists all specs from the `sample-specs` blob container (the same library managed by the admin screen). The user selects one.
- **FR-11:** On submit, the API creates a project record in Cosmos DB and creates a blob container for the project in the stamp's storage account. If the container already exists, it is left as-is (not deleted or overwritten).
- **FR-12:** After creation, the user is navigated to the project detail page.

**Layout:** The "New Project" form is presented as a separate page at `/projects/new` (not a modal).

- **Name field:** Text input, required, max 100 characters. Label: "Project Name". Placeholder: "My awesome app". Auto-focused on page load.
- **Sample spec picker:** A select dropdown (shadcn/ui `Select` component) listing all specs by filename (without the `.md` extension). Label: "Sample Spec". Required. The dropdown loads specs from `GET /api/sample-specs` on mount. If the specs are still loading, show a disabled select with "Loading specs..." placeholder. If no specs exist, show "No specs available — upload specs in Admin first" and disable the submit button.
- **Submit button:** Label: "Create Project". Disabled while the form is submitting (shows a spinner icon). On success, navigates to `/projects/:id`. On failure, shows a toast error.
- **Cancel button:** Navigates back to the dashboard.

**Validation:** Name is required and must not be empty. Spec selection is required. Validate on submit. Show inline error messages below each field using shadcn/ui form error styling.

### 3.4 Project Detail & Log Viewer

- **FR-13:** The project detail page shows the project name, created date, and a log viewer.
- **FR-14:** The log viewer reads log files from the project's blob container. The API reads all `.log` files (or `events.jsonl` if present) from the container and returns their contents.
- **FR-15:** The frontend polls the logs endpoint every 5–10 seconds and renders events as a single auto-scrolling monospace list — one line per event, newest at the bottom. Each line shows `timestamp  agent  event_type  details`. Example:

```
07:35:21  orchestrator  run_started         builders=2
07:35:22  bootstrap     bootstrap_complete  repo=markgar/bookstore
07:35:25  planner       backlog_complete    stories=12
07:35:40  builder-1     story_claimed       #3 Create Book model
07:36:10  builder-1     copilot_call        tokens=1847 dur=8.2s
07:42:00  builder-1     milestone_complete  Scaffolding — Backend
07:42:30  validator     validation_complete 3/3 PASS
```

No filtering, grouping, or drill-down — just a raw chronological feed.

- **FR-16:** Polling can be manually paused/resumed by the user.

**Layout:** Route: `/projects/:id`.

- **Header area:** Project name as the page heading, with the created date below it in muted text. A "Back to Dashboard" link (or breadcrumb) above the heading.
- **Log viewer:** Fills the remaining vertical space below the header. It is a scrollable `<pre>` or `<div>` with `font-mono text-sm` styling and a dark background (e.g., `bg-zinc-900 text-zinc-100`) for a terminal-like feel. Rounded corners, subtle border.
- **Auto-scroll:** The log viewer scrolls to the bottom whenever new lines are appended. If the user manually scrolls up, auto-scroll pauses (so they can read older output). Auto-scroll resumes when the user scrolls back to the bottom.
- **Pause/Resume button:** A small toggle button in the top-right corner of the log viewer (inside the viewer frame). Shows "Pause" with a pause icon when polling is active. Shows "Resume" with a play icon when paused. Polling state is shown with a subtle pulsing dot indicator (green = polling, grey = paused).

**Responsive behavior:**
- **Desktop:** Log viewer has a fixed height (`calc(100vh - <header height>)`) so it fills the viewport with its own internal scroll.
- **Mobile:** Log viewer is full-width. Each log line wraps naturally (no horizontal scroll). Font size drops to `text-xs` on mobile for readability. The header stacks vertically (name, date, back link).

**Empty state:** If the blob container exists but has no log files, show "No logs yet — logs will appear here when a build runs."

**Error state:** If the container doesn't exist or the API fails, show "Could not load logs" with a retry button. Don't crash the page.

**Loading state:** Show "Loading logs..." with a spinner on initial load. Subsequent polls update silently (no loading indicator for poll refreshes).

### 3.5 Sample Specs Admin Screen

- **FR-17:** The Sample Specs page lists all markdown files in the `sample-specs` blob container on the stamp's storage account.
- **FR-18:** Each row shows the spec's filename, file size, and last modified date.
- **FR-19:** The admin can **upload** one or more `.md` files to the `sample-specs` container.
- **FR-20:** The admin can **delete** a spec from the container.
- **FR-21:** The admin can **view** a spec's content in a modal dialog with a scrollable preview of the markdown text. The modal also has a **download** button to download the file.
- **FR-22:** The list refreshes after upload or delete operations.

**Layout:** Route: `/admin/sample-specs`.

- **Page heading:** "Sample Specs" with an "Upload" button right-aligned on the same row.
- **Table columns:** **Filename**, **Size** (human-readable, e.g., "12.4 KB"), **Last Modified** (readable date/time), **Actions**.
- **Actions column:** Two icon buttons per row — an eye icon for "View" and a trash icon for "Delete".

**Upload behavior:**
- Clicking "Upload" opens the browser's native file picker (accepts `.md` files only, multiple selection enabled).
- After file(s) are selected, each file is uploaded via `POST /api/sample-specs` (sequentially or in parallel).
- Show a toast notification for each successful upload ("Uploaded filename.md"). Show an error toast if any upload fails.
- The table refreshes automatically after all uploads complete.

**Delete behavior:**
- Clicking the delete icon shows a confirmation dialog (shadcn/ui `AlertDialog`): "Delete spec-name.md? This cannot be undone." with "Cancel" and "Delete" buttons.
- On confirm, calls `DELETE /api/sample-specs/:name`. Shows a success toast. The table refreshes.
- The delete button is disabled (with a spinner) while the delete is in progress.

**View modal:**
- Clicking the view icon opens a shadcn/ui `Dialog` (modal).
- Modal title: the filename.
- Modal body: the raw markdown content rendered in a scrollable `<pre>` block with `font-mono text-sm` styling. Max height ~70vh with overflow-y scroll.
- Modal footer: a "Download" button (triggers a browser file download of the raw `.md` content) and a "Close" button.

**Responsive behavior:**
- **Desktop:** Full table layout.
- **Mobile:** Table switches to a card-per-spec layout. Each card shows filename (bold), size and date on a second line, and action icons in a row at the bottom of the card. The view modal is full-screen on mobile (`max-w-full h-full` or `DialogContent` with `className="sm:max-w-2xl"`).

**Empty state:** "No sample specs uploaded yet. Click Upload to add your first spec."

**Loading state:** Skeleton rows while the list loads.

**Error state:** Toast + inline "Failed to load specs" with retry button.

### 3.6 Data Model

#### Cosmos DB Strategy

All application data lives in **one container** named `items` in the `autodev` database. The container's partition key is `/organizationId`.

Every document has these common fields:

| Field | Purpose |
|---|---|
| `id` | Unique document ID (auto-generated UUID) |
| `organizationId` | The organization (tenant) this document belongs to. This is the partition key. For now, hardcode to `"default"` (single-tenant). Future: per-org ID. |
| `type` | Discriminator string — `"project"`, `"run"`, etc. Used to distinguish entity types in the shared container. |

**Why one container?** Cosmos DB charges per container (minimum 400 RU/s each). Colocating entity types in one container avoids multiplying that baseline cost. Multiple entity types in one container is explicitly recommended by Microsoft for related data that shares a partition key.

**Why partition by tenant?** All entities for a tenant land in the same logical partition. This means every query within a tenant is a single-partition query — the cheapest and fastest read pattern in Cosmos DB. Cosmos DB indexes all properties by default, so filtering by `type` within a partition is an **index seek, not a scan**.

#### Entities

**Project**

```json
{
  "id": "proj-abc123",
  "organizationId": "default",
  "type": "project",
  "name": "My Cool App",
  "specName": "minimal-node-api.md",
  "createdAt": "2026-03-01T12:00:00Z",
  "latestRunStatus": "running",
  "runCount": 3
}
```

- `specName` — the sample spec chosen at creation time.
- `latestRunStatus` — denormalized from the most recent run. One of: `"pending"`, `"running"`, `"succeeded"`, `"failed"`, or `null` if no runs exist. Updated when a run status changes.
- `runCount` — denormalized count of runs for this project. Updated when a new run is created.
- The project ID is also used as the blob container name for that project's logs.

**Run** (future — not in the current build, but the model supports it)

```json
{
  "id": "run-xyz789",
  "organizationId": "default",
  "type": "run",
  "projectId": "proj-abc123",
  "projectName": "My Cool App",
  "status": "running",
  "startedAt": "2026-03-01T12:05:00Z",
  "completedAt": null,
  "logBlobName": "run-xyz789.log"
}
```

- `projectId` — reference to the parent project. This is the Cosmos DB equivalent of a foreign key. There is no database-level constraint; the app enforces referential integrity.
- `projectName` — denormalized from the project so that run listings don't require a second query.

#### Data Model Rules

These rules apply now and to all future entities added to the container:

1. **One container, one partition key.** All entity types go in the `items` container, partitioned by `organizationId`. Never create additional containers for new entity types.
2. **Embed small, bounded data inside the parent document.** If a child collection is small (< ~20 items) and doesn't change independently, embed it as an array on the parent. Example: a project's tag list.
3. **Separate documents for growing or independent data.** If the child collection is unbounded or changes independently, store each child as its own document with a reference back to the parent (e.g., `projectId` on a run). Never store an ever-growing array of child IDs on the parent — Cosmos items have a 2 MB size limit and growing arrays cause write amplification.
4. **Denormalize hot-path summaries onto the parent.** Store pre-calculated values on the parent that would otherwise require aggregation queries (e.g., `latestRunStatus`, `runCount`). Update these on write.

#### What Goes Where

| Data | Storage | Reason |
|---|---|---|
| Projects | Cosmos DB (`items` container) | Structured, queryable, small docs |
| Runs (future) | Cosmos DB (`items` container) | Same partition as parent project, cheap single-partition queries |
| Sample specs | Azure Blob Storage (`sample-specs` container) | Markdown files, variable size, no query needs |
| Build logs | Azure Blob Storage (container per project, named by project ID) | Large, append-only text, read sequentially |

#### Container Initialization

On app startup, the API calls `database.containers.createIfNotExists({ id: "items", partitionKey: { paths: ["/organizationId"] } })`. This is idempotent — it creates the container on first run and is a no-op thereafter. The database itself is also created with `client.databases.createIfNotExists({ id: "autodev" })`.

### 3.7 API

#### Projects

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/projects` | Create a project (name, selected sample spec) → Cosmos record + blob container |
| GET | `/api/projects` | List all projects (id, name, createdAt) |
| GET | `/api/projects/:id` | Get project details |
| GET | `/api/projects/:id/logs` | Get log content from the project's blob container |

#### Sample Specs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sample-specs` | List all blobs in the `sample-specs` container (name, size, last modified) |
| GET | `/api/sample-specs/:name` | Get the content of a specific spec |
| POST | `/api/sample-specs` | Upload a markdown file to the container |
| DELETE | `/api/sample-specs/:name` | Delete a spec from the container |

### 3.8 Storage & Data

- **FR-23:** The app reads its stamp ID from the `STAMP_ID` environment variable (defaults to `qqq` if not set) and derives the storage account name as `stautodev{STAMP_ID}` and the Cosmos DB account as `cosmos-autodev-{STAMP_ID}`.
- **FR-24:** The app authenticates to Azure Storage and Cosmos DB using `DefaultAzureCredential` (supports managed identity in production and CLI/environment credentials in local dev).
- **FR-25:** Sample specs are stored in the `sample-specs` blob container.
- **FR-26:** Each project's logs are stored in a blob container named by the project's ID.
- **FR-27:** When creating a project, if the blob container already exists, leave it as-is. Do not delete or overwrite existing containers.
- **FR-28:** All Cosmos DB data lives in the `autodev` database, `items` container, partition key `/organizationId`. The app creates the database and container on startup using `createIfNotExists` — see Section 3.6 for details.
- **FR-29:** When querying Cosmos DB, always include `organizationId` in the query filter so that every query is a single-partition query. Never issue cross-partition queries.

---

## 4. Infrastructure Context (Informational Only)

> **DO NOT BUILD OR PROVISION INFRASTRUCTURE.** The infrastructure already exists and is managed separately. This section is provided only so the application code knows how to discover and connect to its backing resources. The app's job is to run on this infrastructure, not create it. Do not generate Bicep, ARM, Terraform, or any IaC code.

AutoDev is deployed as a **stamp** — a self-contained set of infrastructure in a single Azure resource group, identified by a **3-letter stamp ID** (e.g., `dev`, `qqq`, `abc`). The app discovers all its resources by convention from the stamp ID.

### Naming Convention

| Resource type | Naming pattern | Example (`qqq`) |
|---|---|---|
| Storage Account | `stautodev{stampId}` | `stautodevqqq` |
| Cosmos DB Account | `cosmos-autodev-{stampId}` | `cosmos-autodev-qqq` |

Storage accounts omit hyphens because Azure requires alphanumeric-only names for that resource type.

### What the App Needs to Know

- The stamp ID comes from the `STAMP_ID` environment variable (defaults to `qqq`).
- The storage account name is derived as `stautodev{STAMP_ID}`.
- The Cosmos DB account is derived as `cosmos-autodev-{STAMP_ID}`.
- The app authenticates using `DefaultAzureCredential` (managed identity in production, Azure CLI locally).

---

## 5. Technology Stack

**Single container.** The entire application — frontend and API — is served from one container. Express serves the Vite-built React SPA as static files and handles `/api/*` routes. No separate frontend hosting, no BFF, no microservices.

| Layer | Technology |
|---|---|
| **Backend API** | Node.js + TypeScript (Express) |
| **Frontend** | React SPA (Vite, TypeScript) |
| **UI** | [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS |
| **Azure SDKs** | `@azure/storage-blob`, `@azure/identity`, `@azure/cosmos` |
| **Build tooling** | Vite (frontend), tsc (backend) |

### UI Stack

Use [shadcn/ui](https://ui.shadcn.com/) with its default theme. It's opinionated, looks good out of the box, and requires no design work. Use the default neutral palette and don't invent custom styles. Boring and consistent is the goal.

- **shadcn/ui** — component library (built on Radix UI primitives)
- **Tailwind CSS** — all styling via utility classes, no custom CSS
- **Lucide React** — icons (shadcn/ui default)
- **Sonner** — toast notifications
- **TanStack Table** — data tables (if needed)
- **React Hook Form + Zod** — forms and validation (if needed)

### Responsive Design

The app must work well at both desktop and mobile widths. No hardcoded pixel widths anywhere.

- **Breakpoint:** Use Tailwind's `md:` (768px) as the single breakpoint. Below 768px = mobile layout. At or above 768px = desktop layout.
- **Sidebar:** Persistent on desktop, slide-over overlay on mobile (triggered by hamburger button in a top bar).
- **Tables:** Render as HTML tables on desktop. On mobile, switch to stacked card layouts (one card per row) using Tailwind responsive utilities.
- **Modals/Dialogs:** Constrained width on desktop (`sm:max-w-2xl`), full-width on mobile.
- **Typography:** Base `text-sm` on mobile, `text-base` on desktop where appropriate. Monospace content (logs) uses `text-xs` on mobile, `text-sm` on desktop.
- **Spacing:** Use Tailwind's spacing scale. Content areas use `px-4` on mobile, `px-6` or `px-8` on desktop.
- **Touch targets:** Buttons and interactive elements must be at least 44px tall on mobile for tap-friendliness.
