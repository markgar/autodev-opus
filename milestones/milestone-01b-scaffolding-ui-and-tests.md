# Milestone 01b — Scaffolding: UI Libraries and Test Infrastructure

## Milestone: UI component libraries, icon/toast setup, and test infrastructure

> **Validates:** shadcn/ui cn() helper exists and components.json is configured. Lucide React and Sonner are installed with `<Toaster />` rendered in App.tsx. `npm test` exits with code 0 (both backend and frontend placeholder tests pass).

> **Reference files:** All files produced by Milestone 01a (package.json, tsconfig.base.json, src/server/index.ts, src/client/main.tsx, src/client/App.tsx, vite.config.ts).

## Tasks

- [x] Install and initialize shadcn/ui: install class-variance-authority clsx tailwind-merge, create src/client/lib/utils.ts with the cn() helper function, create components.json for shadcn/ui CLI configuration pointing to src/client/components/ui and src/client/lib/utils, configure tsconfig path alias "@/" mapping to "src/client/"
- [ ] Install Lucide React icons and Sonner toast library: add lucide-react and sonner packages, add `<Toaster />` from sonner to App.tsx
- [ ] Install and configure vitest for backend tests: add vitest as a dev dependency, create src/server/vitest.config.ts (test root: src/server, environment: node), add "test:server" script to package.json running vitest with this config
- [ ] Add one placeholder backend test: create src/server/__tests__/health.test.ts that imports the test function from vitest, asserts that true equals true (e.g., `expect(1 + 1).toBe(2)`), and has a descriptive test name like "placeholder server test runs successfully"
- [ ] Install and configure vitest + testing-library for frontend tests: add @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom as dev dependencies, create src/client/vitest.config.ts (test root: src/client, environment: jsdom, setupFiles pointing to a test setup file), create src/client/test-setup.ts that imports @testing-library/jest-dom/vitest, add "test:client" script to package.json running vitest with this config
- [ ] Add one placeholder frontend test: create src/client/__tests__/App.test.tsx that imports render from @testing-library/react, renders `<App />`, and asserts the heading "AutoDev" is present in the document using screen.getByText
- [ ] Add root "test" script in package.json that runs both test:server and test:client (e.g., "vitest run --config src/server/vitest.config.ts && vitest run --config src/client/vitest.config.ts" or sequential npm run test:server && npm run test:client)
