/**
 * Shared Cosmos DB mock factory for test files that import app.ts.
 *
 * projectsService.ts evaluates `cosmosClient.database(...).container(...)`
 * at module scope, so every test that imports app.ts must mock the full chain.
 * This helper centralises that shape so changes propagate to all tests at once.
 */

interface CosmosMockOverrides {
  getDatabaseAccount?: () => Promise<unknown>;
  fetchAll?: () => Promise<{ resources: unknown[] }>;
  read?: () => Promise<{ resource: unknown }>;
  create?: () => Promise<unknown>;
}

export function createMockCosmosClient(overrides: CosmosMockOverrides = {}) {
  return {
    getDatabaseAccount:
      overrides.getDatabaseAccount ?? (() => Promise.resolve({})),
    database: () => ({
      container: () => ({
        items: {
          create: overrides.create ?? (() => Promise.resolve({})),
          query: () => ({
            fetchAll:
              overrides.fetchAll ??
              (() => Promise.resolve({ resources: [] })),
          }),
        },
        item: () => ({
          read:
            overrides.read ??
            (() => Promise.resolve({ resource: null })),
        }),
      }),
    }),
  };
}
