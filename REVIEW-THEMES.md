# Review Themes

Last updated: Pre-flight fixes and Project data model

1. **Validate environment variables after parsing.** Never trust `parseInt(process.env.X)` without checking for `NaN` and range — fail fast with an actionable error message naming the env var.
2. **Scope SPA catch-all routes to exclude `/api/*`.** A blanket `app.get("/{*splat}")` will serve HTML for unmatched API paths, masking 404 errors and confusing JSON-expecting clients.
3. **Keep cross-file configuration in sync.** When a value is configurable in one place (e.g. server PORT), every other reference to it (e.g. Vite proxy target) must use the same source of truth.
4. **Separate app creation from listen side effects.** Export a configured Express app from one module and call `app.listen()` in a separate entry-point module so the app is importable for testing without starting a server.
5. **Mount routers with path prefixes, not hardcoded full paths.** Define routes relative to their mount point (`router.get("/health")` mounted at `/api`) so route files are composable and the prefix isn't duplicated across every route file.
6. **Declare type dependencies explicitly.** Don't rely on transitive `@types/*` resolution — if your code uses `node:path` or `node:url`, list `@types/node` in devDependencies directly.
7. **Don't emit build artifacts that nothing consumes.** Flags like `declaration: true` in a private app's tsconfig produce dead `.d.ts` files — only enable them in configs where consumers exist.
8. **Sync tests with code changes in the same milestone.** When a bug fix or refactoring changes a function's call signature (adding parameters, changing arguments), grep for all test assertions on that function and update them in the same commit — stale assertions silently break or weaken the test suite.
9. **Avoid asserting on raw source text.** Tests that `readFileSync` a `.ts` file and check `toContain("string")` break on any refactoring — import and test the actual runtime behavior, or use resilient patterns.
10. **Don't duplicate test suites across files.** Before adding a new test file, check if existing tests already assert the same thing — duplicate tests multiply maintenance cost without adding coverage.
11. **Use `||` not `??` for string env var defaults.** Nullish coalescing (`??`) doesn't catch empty strings — `VAR=""` bypasses the default, producing invalid derived values. Use `||` when empty string should also trigger the fallback.
12. **Update copilot-instructions.md Key files when changing file responsibilities.** When a milestone adds new behavior to an existing file (e.g. adding DB init to a startup entry point), update its Key files description in the same milestone — stale descriptions mislead future agents.
13. **Extract shared constants for cross-module magic strings.** When two or more modules reference the same literal (database name, container name, endpoint), define it once in a shared constants or config module to prevent divergence.
14. **Resolve merge conflict markers before committing.** After any rebase or merge, grep for `<<<<<<<`, `=======`, `>>>>>>>` markers — unresolved conflicts silently corrupt files and produce garbled documentation.
15. **Match documentation constraints to code validation.** When a config value has programmatic validation (regex, range check), ensure DEPLOY.md, README, and env-var tables describe the same constraints the code enforces.
16. **Sanitize user-supplied resource names.** When a route param or request body field is used as a storage key (blob name, file path, DB id), validate it against a strict allowlist pattern — don't rely on `.endsWith()` alone.
17. **Preserve structured error properties across service boundaries.** When wrapping Azure SDK or other library errors, keep the original `statusCode`/`code` properties instead of stringifying into a plain `Error` — route handlers need structured data to return correct HTTP status codes.
18. **Bootstrap all required storage resources at startup.** When adding a new external dependency (blob container, DB table, queue), add initialization logic alongside existing init functions — don't assume resources exist.
19. **Align client and server size limits.** When client-side code enforces a max file/payload size, ensure the server's body-parser limit (Express `json({ limit })`) is at least as large — mismatched limits cause opaque 413 errors.
20. **Use async/await consistently — no mixed patterns in new code.** When the project convention says "async/await everywhere," don't introduce `.then()/.catch()` chains in new functions — mixed patterns confuse both humans and LLMs extending the code.
21. **Extract custom hooks when page components exceed ~60 lines.** When a React page mixes state management, data fetching, mutation logic, and rendering, extract the non-rendering concerns into a custom hook to keep the component focused on UI.
22. **Update deployment docs when fixing the issues they describe.** When a code change fixes a limitation documented in DEPLOY.md Known Gotchas or README, update the documentation in the same commit — stale "not supported" notes actively mislead developers.
