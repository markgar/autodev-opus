# Milestone 01 — Scaffolding

## Milestone: Project scaffolding with Express + React + Vite + TypeScript

> **Validates:** `npm install` completes without errors. `npm run build` compiles both server and client without errors. `npm start` starts the server on the default port. `GET /api/health` returns HTTP 200 with JSON body `{ "status": "ok" }`. The client SPA loads at `GET /` returning HTTP 200 with HTML content. `npm test` exits with code 0 (both backend and frontend placeholder tests pass).

> **Reference files:** This is the first milestone — no existing files to reference. The builder creates all infrastructure from scratch. Key files to produce: `package.json` (root), `tsconfig.base.json`, `src/server/index.ts`, `src/client/main.tsx`, `src/client/App.tsx`, `vite.config.ts`.

## Tasks

- [ ] Initialize root package.json (name: "autodev", private: true, type: "module") and create tsconfig.base.json with strict mode, ES2022 target, module NodeNext, and shared compiler options that server and client tsconfigs will extend
- [ ] Scaffold Express server entry point: create src/server/tsconfig.json extending base, install express and @types/express, create src/server/index.ts that initializes an Express app and listens on PORT env var (default 3000)
- [ ] Add GET /api/health route in src/server/routes/health.ts returning JSON `{ "status": "ok" }` with 200 status, register it in the Express app
- [ ] Scaffold React + Vite client: install react, react-dom, @types/react, @types/react-dom, vite, @vitejs/plugin-react, create vite.config.ts in project root (root: "src/client", build outDir: "../../dist/client"), create src/client/index.html, src/client/main.tsx, src/client/App.tsx with a placeholder heading "AutoDev", create src/client/tsconfig.json extending base with jsx: "react-jsx" and dom lib
- [ ] Configure Tailwind CSS v4 for the client: install tailwindcss @tailwindcss/vite, add the Tailwind Vite plugin to vite.config.ts, create src/client/index.css with `@import "tailwindcss"` directive, import index.css in main.tsx
- [ ] Install and initialize shadcn/ui: install class-variance-authority clsx tailwind-merge, create src/client/lib/utils.ts with the cn() helper function, create components.json for shadcn/ui CLI configuration pointing to src/client/components/ui and src/client/lib/utils, configure tsconfig path alias "@/" mapping to "src/client/"
- [ ] Install Lucide React icons and Sonner toast library: add lucide-react and sonner packages, add `<Toaster />` from sonner to App.tsx
- [ ] Configure build and dev scripts in root package.json: "build:server" compiles server TypeScript via tsc -p src/server/tsconfig.json (outDir: dist/server), "build:client" runs vite build, "build" runs both build:server and build:client, "dev" runs server and client dev concurrently (tsx watch for server, vite dev for client with API proxy to server port), "start" runs the production build with node dist/server/index.js
- [ ] Configure Express to serve static client files: in src/server/index.ts, when not in development mode, serve dist/client/ as static files via express.static and add a catch-all GET route that returns dist/client/index.html for SPA client-side routing (all non-/api/* routes)
- [ ] Install and configure vitest for backend tests: add vitest as a dev dependency, create src/server/vitest.config.ts (test root: src/server, environment: node), add "test:server" script to package.json running vitest with this config
- [ ] Add one placeholder backend test: create src/server/__tests__/health.test.ts that imports the test function from vitest, asserts that true equals true (e.g., `expect(1 + 1).toBe(2)`), and has a descriptive test name like "placeholder server test runs successfully"
- [ ] Install and configure vitest + testing-library for frontend tests: add @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom as dev dependencies, create src/client/vitest.config.ts (test root: src/client, environment: jsdom, setupFiles pointing to a test setup file), create src/client/test-setup.ts that imports @testing-library/jest-dom/vitest, add "test:client" script to package.json running vitest with this config
- [ ] Add one placeholder frontend test: create src/client/__tests__/App.test.tsx that imports render from @testing-library/react, renders `<App />`, and asserts the heading "AutoDev" is present in the document using screen.getByText
- [ ] Add root "test" script in package.json that runs both test:server and test:client (e.g., "vitest run --config src/server/vitest.config.ts && vitest run --config src/client/vitest.config.ts" or sequential npm run test:server && npm run test:client)
