# User Journeys

## J-1: Smoke — Health check and app shell navigation
<!-- after: 3 -->
<!-- covers: scaffolding.health, navigation, app-shell -->
<!-- tags: smoke -->
Hit GET /api/health → verify 200 OK response → Load app at / → Verify "AutoDev" heading in sidebar → Verify "Projects" section with "Dashboard" item and "Admin" section with "Sample Specs" item → Click "Dashboard" → Verify active nav highlight → Click "Sample Specs" → Verify navigation to /admin/sample-specs and active highlight updates → Click "Dashboard" again → Verify return to /

## J-2: Dashboard lists projects and navigates to detail
<!-- after: 4 -->
<!-- covers: projects.dashboard, projects.list -->
Load dashboard at / → Verify loading skeleton appears while data loads → Projects list renders in a table with Name and Created columns → Verify projects sorted by newest first → Click a project row → Verify navigation to /projects/:id → Click "Back to Dashboard" → Verify return to project list

## J-3: Empty dashboard and project creation entry point
<!-- after: 4 -->
<!-- covers: projects.dashboard, projects.empty-state -->
<!-- tags: smoke -->
Load dashboard with no existing projects → See centered "No projects yet" message → Click "Create your first project" button → Verify navigation to /projects/new → Click cancel → Return to dashboard → Click "New Project" button in page header → Verify navigation to /projects/new again

## J-4: Sample specs full CRUD lifecycle
<!-- after: 7 -->
<!-- covers: specs.list, specs.upload, specs.delete, specs.view -->
Navigate to Admin → Sample Specs via sidebar → See empty state "No sample specs uploaded yet" message → Click "Upload" → Select a .md file from file picker → See success toast "Uploaded filename.md" → Verify spec appears in table with filename, human-readable size, and last modified date → Click view (eye) icon → See modal with filename as title and raw markdown in scrollable pre block → Click "Download" in modal footer → Verify file download triggers → Click "Close" → Modal closes → Click delete (trash) icon → See confirmation dialog "Delete filename.md? This cannot be undone." → Click "Delete" → See success toast → Verify spec removed from table → See empty state again

## J-5: Create a new project end-to-end
<!-- after: 7 -->
<!-- covers: projects.create, specs.list, navigation -->
Navigate to Dashboard via sidebar → Click "New Project" button → Arrive at /projects/new → Verify name field is auto-focused → Enter "My Test App" as project name → Open sample spec picker dropdown → Verify specs loaded (filenames without .md extension) → Select a spec → Click "Create Project" → Verify submit button shows spinner while submitting → Verify navigation to /projects/:id on success → See project name "My Test App" on detail page → Navigate back to Dashboard → Verify "My Test App" appears in project list with created date

## J-6: Project detail page and log viewer interaction
<!-- after: 6 -->
<!-- covers: projects.detail, projects.logs -->
Navigate to Dashboard → Click a project → Verify project name displayed as heading → Verify created date in muted text below heading → Verify "Back to Dashboard" link above heading → See terminal-style log viewer (dark background, monospace font) → Verify green pulsing dot indicating active polling → Observe log lines appearing (timestamp, agent, event_type, details) → Scroll up manually in log viewer → Verify auto-scroll pauses → Click "Pause" button → Verify button changes to "Resume" with play icon → Verify polling indicator turns grey → Click "Resume" → Verify polling resumes with green indicator → Scroll to bottom → Verify auto-scroll re-engages when new lines arrive

## J-7: End-to-end — Upload spec, create project, view logs
<!-- after: 7 -->
<!-- covers: specs.upload, projects.create, projects.detail, projects.logs, navigation, azure.clients -->
Navigate to Admin → Sample Specs → Upload a new spec file "my-app-spec.md" → Verify it appears in the list → Click "Dashboard" in sidebar → Click "New Project" → Enter project name "E2E Test Project" → Select "my-app-spec" from spec picker → Click "Create Project" → Arrive at project detail page → Verify heading shows "E2E Test Project" → See log viewer area (shows "No logs yet" or streaming logs) → Verify polling indicator present → Click "Back to Dashboard" → Verify "E2E Test Project" in project list with correct name and date

## J-8: New project form validation and cancel
<!-- after: 7 -->
<!-- covers: projects.create, projects.validation -->
Navigate to /projects/new → Click "Create Project" without filling any fields → See inline error below name field (required) → See inline error for spec selection (required) → Type a name → Clear it → Verify name required error reappears → Enter valid project name → Click "Create Project" without selecting a spec → See spec required error → Click "Cancel" button → Verify navigation back to dashboard → Return to /projects/new → Fill valid name and select a spec → Click "Create Project" → Verify successful creation and redirect to detail page

## J-9: Responsive mobile layout across all pages
<!-- after: 7 -->
<!-- covers: app-shell.responsive, projects.dashboard, specs.list, projects.detail -->
Set viewport to mobile width (<768px) → Verify sidebar is hidden → See hamburger menu button in top bar → Tap hamburger → Sidebar slides over as overlay → Tap "Dashboard" → Sidebar closes → Dashboard shows projects as stacked cards (not table) → Tap hamburger → Tap "Sample Specs" → Sidebar closes → Specs page shows card-per-spec layout → Tap view on a spec → Modal opens full-width → Close modal → Tap hamburger → Navigate to a project detail → Log viewer is full-width with text-xs font → Tap outside sidebar if open → Verify sidebar closes

## J-10: Dashboard error state and retry
<!-- after: 4 -->
<!-- covers: projects.dashboard, projects.error-state -->
Load dashboard → API call fails → See toast error notification (Sonner) → See inline "Failed to load projects" message → See "Retry" button → Click "Retry" → API succeeds → Project list loads and displays correctly → Verify table renders with projects

## J-11: Sample specs multi-upload and error handling
<!-- after: 7 -->
<!-- covers: specs.upload, specs.list, specs.error-state -->
Navigate to Admin → Sample Specs → Click "Upload" → Select multiple .md files → See individual success toast for each uploaded file → Verify all specs appear in table with correct filenames, sizes, and dates → Simulate API failure on list refresh → See error toast → See "Failed to load specs" with retry button → Click retry → List recovers and shows all uploaded specs

## J-12: Project creation with no specs available
<!-- after: 7 -->
<!-- covers: projects.create, specs.empty-state -->
Ensure no sample specs exist in blob storage → Navigate to /projects/new → Spec picker shows "No specs available — upload specs in Admin first" → Verify "Create Project" button is disabled → Navigate to Admin → Sample Specs → Upload a spec → Navigate back to /projects/new → Spec picker now lists the uploaded spec → Select it → Enter project name → Click "Create Project" → Verify project created successfully and redirected to detail page
