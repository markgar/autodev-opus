# Milestone 01a — Scaffolding: Core App Structure

## Milestone: Project scaffolding — server, client, build, and static serving

> **Validates:** `npm install` completes without errors. `npm run build` compiles both server and client without errors. `npm start` starts the server on the default port. `GET /api/health` returns HTTP 200 with JSON body `{ "status": "ok" }`. The client SPA loads at `GET /` returning HTTP 200 with HTML content.

> **Reference files:** This is the first milestone — no existing files to reference. The builder creates all infrastructure from scratch. Key files to produce: `package.json` (root), `tsconfig.base.json`, `src/server/index.ts`, `src/client/main.tsx`, `src/client/App.tsx`, `vite.config.ts`.

## Tasks

- [x] Initialize root package.json (name: "autodev", private: true, type: "module") and create tsconfig.base.json with strict mode, ES2022 target, module NodeNext, and shared compiler options that server and client tsconfigs will extend
- [x] Scaffold Express server entry point: create src/server/tsconfig.json extending base, install express and @types/express, create src/server/index.ts that initializes an Express app and listens on PORT env var (default 3000)
- [ ] Add GET /api/health route in src/server/routes/health.ts returning JSON `{ "status": "ok" }` with 200 status, register it in the Express app
- [ ] Scaffold React + Vite client: install react, react-dom, @types/react, @types/react-dom, vite, @vitejs/plugin-react, create vite.config.ts in project root (root: "src/client", build outDir: "../../dist/client"), create src/client/index.html, src/client/main.tsx, src/client/App.tsx with a placeholder heading "AutoDev", create src/client/tsconfig.json extending base with jsx: "react-jsx" and dom lib
- [ ] Configure Tailwind CSS v4 for the client: install tailwindcss @tailwindcss/vite, add the Tailwind Vite plugin to vite.config.ts, create src/client/index.css with `@import "tailwindcss"` directive, import index.css in main.tsx
- [ ] Configure build and dev scripts in root package.json: "build:server" compiles server TypeScript via tsc -p src/server/tsconfig.json (outDir: dist/server), "build:client" runs vite build, "build" runs both build:server and build:client, "dev" runs server and client dev concurrently (tsx watch for server, vite dev for client with API proxy to server port), "start" runs the production build with node dist/server/index.js
- [ ] Configure Express to serve static client files: in src/server/index.ts, when not in development mode, serve dist/client/ as static files via express.static and add a catch-all GET route that returns dist/client/index.html for SPA client-side routing (all non-/api/* routes)
