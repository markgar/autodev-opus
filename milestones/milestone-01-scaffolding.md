# Milestone 01 — Scaffolding

## Milestone: Project scaffolding with Express server, React SPA, and test framework

> **Validates:** After build completes: `npm install` exits 0, `npm run build` exits 0, `npm start` starts the server on PORT (default 3000), `GET /api/health` returns HTTP 200 with JSON `{ "status": "ok" }`, `npm test` exits 0 with at least 2 passing tests (one backend, one frontend). The root URL (`GET /`) serves the React SPA HTML page.

> **Reference files:** This is the first milestone — no existing source files to reference. The builder should follow SPEC.md for architecture (src/server/ and src/client/ as siblings, Express serves API + static SPA) and `.github/copilot-instructions.md` for coding conventions.

## Tasks

- [ ] Initialize root package.json with name "autodev", TypeScript, Express, and dev dependencies (typescript, @types/node, @types/express, ts-node-dev, concurrently)
- [ ] Add TypeScript configuration: root tsconfig.json with strict mode enabled, and src/server/tsconfig.json extending root targeting Node (module: NodeNext, outDir: ../../dist/server)
- [ ] Create Express server entry point at src/server/index.ts — create Express app, enable JSON body parsing, listen on PORT env var (default 3000), log "Server listening on port {PORT}" to console
- [ ] Add health route module at src/server/routes/health.ts — export a Router with GET /api/health returning JSON { status: "ok" }, register it in the Express app
- [ ] Scaffold Vite React-TS frontend: add vite.config.ts at project root (root: "src/client", build.outDir: "../../dist/client"), create src/client/index.html, src/client/main.tsx (renders App into #root), src/client/App.tsx (renders a placeholder heading "AutoDev")
- [ ] Install and configure Tailwind CSS v4 for the Vite client (@tailwindcss/vite plugin in vite.config.ts, import "tailwindcss" in src/client/globals.css, import globals.css in main.tsx)
- [ ] Initialize shadcn/ui: add components.json with style "new-york" and tailwindCss path, create src/client/lib/utils.ts with cn() helper using clsx + tailwind-merge
- [ ] Install Lucide React (lucide-react) and Sonner (sonner) as dependencies
- [ ] Configure build scripts in package.json: "build:server" runs tsc -p src/server/tsconfig.json, "build:client" runs vite build, "build" runs both sequentially, "start" runs node dist/server/index.js
- [ ] Configure dev script in package.json using concurrently: run Express server via ts-node-dev (src/server/index.ts, --respawn) and Vite dev server (vite dev) in parallel
- [ ] Add Vite proxy config: in vite.config.ts, proxy /api/* requests to http://localhost:3000 so the Vite dev server forwards API calls to Express during development
- [ ] Add Express static file serving: in production mode (NODE_ENV=production), serve dist/client as static files and add a catch-all GET route that returns dist/client/index.html for SPA client-side routing
- [ ] Install and configure vitest for backend tests: add vitest as dev dependency, create vitest.server.config.ts (environment: node, include src/server/**/*.test.ts), add one placeholder test at src/server/routes/health.test.ts that asserts 1 + 1 === 2
- [ ] Install and configure vitest + @testing-library/react + @testing-library/jest-dom + jsdom for frontend tests: create vitest.client.config.ts (environment: jsdom, include src/client/**/*.test.tsx), add one placeholder test at src/client/App.test.tsx that asserts true === true
- [ ] Add root "test" script in package.json that runs both test suites: "vitest run --config vitest.server.config.ts && vitest run --config vitest.client.config.ts"
- [ ] Add .gitignore entries for node_modules, dist, and common IDE/OS files if not already present
