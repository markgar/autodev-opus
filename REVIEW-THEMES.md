# Review Themes

Last updated: Project scaffolding — server, client, build, and static serving

1. **Validate environment variables after parsing.** Never trust `parseInt(process.env.X)` without checking for `NaN` and range — fail fast with an actionable error message naming the env var.
2. **Scope SPA catch-all routes to exclude `/api/*`.** A blanket `app.get("/{*splat}")` will serve HTML for unmatched API paths, masking 404 errors and confusing JSON-expecting clients.
3. **Keep cross-file configuration in sync.** When a value is configurable in one place (e.g. server PORT), every other reference to it (e.g. Vite proxy target) must use the same source of truth.
4. **Separate app creation from listen side effects.** Export a configured Express app from one module and call `app.listen()` in a separate entry-point module so the app is importable for testing without starting a server.
5. **Mount routers with path prefixes, not hardcoded full paths.** Define routes relative to their mount point (`router.get("/health")` mounted at `/api`) so route files are composable and the prefix isn't duplicated across every route file.
6. **Declare type dependencies explicitly.** Don't rely on transitive `@types/*` resolution — if your code uses `node:path` or `node:url`, list `@types/node` in devDependencies directly.
7. **Don't emit build artifacts that nothing consumes.** Flags like `declaration: true` in a private app's tsconfig produce dead `.d.ts` files — only enable them in configs where consumers exist.
