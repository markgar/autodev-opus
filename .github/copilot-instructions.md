# Copilot Instructions

## About this codebase

This software is written with assistance from GitHub Copilot. The code is structured to be readable, modifiable, and extendable by Copilot (and other LLM-based agents). Every design decision should reinforce that.

### Guidelines for LLM-friendly code

- **Flat, explicit control flow.** Prefer straightforward if/else and early returns over deeply nested logic, complex inheritance hierarchies, or metaprogramming. Every function should be understandable from its source alone.
- **Small, single-purpose functions.** Keep functions short (ideally under ~40 lines). Each function does one thing with a clear name that describes it. This gives the LLM better context boundaries.
- **Descriptive naming over comments.** Variable and function names should make intent obvious. Use comments only when *why* isn't clear from the code — never to explain *what*.
- **Colocate related logic.** Keep constants, helpers, and the code that uses them close together (or in the same small file). Avoid scattering related pieces across many modules — LLMs work best when relevant context is nearby.
- **Consistent patterns.** When multiple functions do similar things, structure them identically. Consistent shape lets the LLM reliably extend the pattern.
- **No magic.** Avoid decorators that hide behavior, dynamic attribute access, implicit registration, or monkey-patching. Everything should be traceable by reading the code top-to-bottom.
- **Graceful error handling.** Wrap I/O and external calls in try/except (or the language's equivalent). Never let a transient failure crash the main workflow. Log the error and continue.
- **Minimal dependencies.** Only add a dependency when it provides substantial value. Fewer deps mean less surface area for the LLM to misunderstand.
- **One concept per file.** Each module owns a single concern. Don't mix unrelated responsibilities in the same file.
- **Design for testability.** Separate pure decision logic from I/O and subprocess calls so core functions can be tested without mocking. Pass dependencies as arguments rather than hard-coding them inside functions when practical. Keep side-effect-free helpers (parsing, validation, data transforms) in their own functions so they can be unit tested directly.

### Documentation maintenance

- When completing a task that changes the project structure, key files, architecture, or conventions, update `.github/copilot-instructions.md` to reflect the change.
- Keep the project-specific sections (Project structure, Key files, Architecture, Conventions) accurate and current.
- Never modify the coding guidelines or testing conventions sections above.
- This file is a **style guide**, not a spec. Describe file **roles** (e.g. 'server entry point'), not implementation details (e.g. 'uses List<T> with auto-incrementing IDs'). Conventions describe coding **patterns** (e.g. 'consistent JSON error envelope'), not implementation choices (e.g. 'store data in a static variable'). SPEC.md covers what to build — this file covers how to write code that fits the project.

## Project structure

Source code will live in `src/` with two top-level subdirectories:

- `src/server/` — Express API: routes, services, and Azure client initialization.
- `src/client/` — React SPA: pages, components, and hooks. Built by Vite.

Server and client are siblings — server code never imports from `client/` and vice versa. The Express server serves the Vite-built SPA as static files alongside the `/api/*` routes.

## Key files

- `SPEC.md` — Technical specification (tech stack, architecture, data model, API surface).
- `REQUIREMENTS.md` — Original project requirements from the user.
- `BACKLOG.md` — Ordered list of milestones with dependency information.
- `JOURNEYS.md` — User journey descriptions.
- `README.md` — Project overview and getting-started guide.
- `package.json` — Root package manifest with build, dev, test, and start scripts.
- `tsconfig.base.json` — Shared TypeScript compiler options extended by server and client tsconfigs.
- `vite.config.ts` — Vite configuration for the React client build, with Tailwind, `@/` alias, and API proxy.
- `components.json` — shadcn/ui CLI configuration for component generation.
- `src/server/app.ts` — Express app configuration (middleware, routes, static serving). No side effects.
- `src/server/index.ts` — Server startup entry point (port parsing, listen call).
- `src/server/routes/health.ts` — Health check route returning `{ status: "ok" }`.
- `src/server/vitest.config.ts` — Vitest configuration for backend tests (node environment).
- `src/client/main.tsx` — React app entry point.
- `src/client/App.tsx` — Root React component with BrowserRouter, route definitions, and Sonner `<Toaster />`.
- `src/client/components/AppSidebar.tsx` — Sidebar navigation with grouped menu items and active highlighting.
- `src/client/components/AppLayout.tsx` — Root layout wrapping sidebar and routed page content.
- `src/client/pages/` — Convention directory for page-level route components.
- `src/client/lib/utils.ts` — CSS class name merge utility for component styling.
- `src/client/vitest.config.ts` — Vitest configuration for frontend tests (jsdom environment).
- `src/client/test-setup.ts` — Frontend test setup adding DOM assertion matchers.

## Architecture

The Express server exposes API routes under `/api/*` and serves the React SPA as static files from a single container. Thin route handlers delegate to service modules that encapsulate business logic; services call Azure SDK clients (Blob Storage and Cosmos DB) that are initialized once at startup. The React frontend uses client-side routing via React Router (BrowserRouter) and communicates exclusively through the `/api/*` endpoints — it never touches Azure SDKs directly. Data flows inward: routes → services → Azure clients, with no reverse dependencies.

## Testing conventions

- **Use the project's test framework.** Plain functions with descriptive names.
- **Test the contract, not the implementation.** A test should describe expected behavior in terms a user would understand — not mirror the code's internal branching. If the test would break when you refactor internals without changing behavior, it's too tightly coupled.
- **Name tests as behavioral expectations.** `test_expired_token_triggers_refresh` not `test_check_token_returns_false`. The test name should read like a requirement.
- **Use realistic inputs.** Feed real-looking data, not minimal one-line synthetic strings. Edge cases should be things that could actually happen — corrupted inputs, empty files, missing fields.
- **Prefer regression tests.** When a bug is found, write the test that would have caught it before fixing it. This is the highest-value test you can write.
- **Don't test I/O wrappers.** Functions that just read a file and call a pure helper don't need their own tests — test the pure helper directly.
- **No mocking unless unavoidable.** Extract pure functions for testability so you don't need mocks. If you find yourself mocking, consider whether you should be testing a different function.

## Conventions

- **Thin controllers, fat services.** Route handlers validate input and return responses; all business logic lives in service modules.
- **Consistent JSON error envelope.** All API error responses use a structured JSON format with a message field so the frontend can display errors uniformly.
- **Async/await everywhere.** Use async/await for all asynchronous operations — no raw Promise chains or callbacks.
- **Early returns for validation.** Check preconditions at the top of a function and return early on failure rather than wrapping the happy path in nested conditionals.
- **TypeScript strict mode.** All code uses TypeScript with strict compiler settings. Avoid `any`; prefer explicit types and interfaces.
- **Tailwind utility classes only.** All styling uses Tailwind CSS utility classes. No custom CSS files, no inline `style` attributes.
- **shadcn/ui defaults.** Use shadcn/ui components with their default theme and neutral palette. Do not invent custom component styles.
- **Toast for transient feedback.** Use Sonner toasts for success/error notifications on mutations. Use inline error states with retry buttons for failed data fetches.
- **Partition-scoped queries.** Every Cosmos DB query includes `organizationId` in the filter to ensure single-partition reads.
