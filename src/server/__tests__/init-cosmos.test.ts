import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const createIfNotExistsContainer = vi.fn().mockResolvedValue({});
  const createIfNotExistsDb = vi.fn().mockResolvedValue({
    database: {
      containers: { createIfNotExists: createIfNotExistsContainer },
    },
  });
  return { createIfNotExistsDb, createIfNotExistsContainer };
});

vi.mock("../azure/cosmosClient.js", () => ({
  cosmosClient: {
    databases: { createIfNotExists: mocks.createIfNotExistsDb },
  },
}));

import { initCosmos } from "../azure/initCosmos.js";

describe("initCosmos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createIfNotExistsDb.mockResolvedValue({
      database: {
        containers: { createIfNotExists: mocks.createIfNotExistsContainer },
      },
    });
    mocks.createIfNotExistsContainer.mockResolvedValue({});
  });

  it("creates the autodev database", async () => {
    await initCosmos();
    expect(mocks.createIfNotExistsDb).toHaveBeenCalledWith({ id: "autodev" });
  });

  it("creates the items container with organizationId partition key", async () => {
    await initCosmos();
    expect(mocks.createIfNotExistsContainer).toHaveBeenCalledWith({
      id: "items",
      partitionKey: { paths: ["/organizationId"] },
    });
  });

  it("creates the container after the database", async () => {
    const callOrder: string[] = [];
    mocks.createIfNotExistsDb.mockImplementation(async () => {
      callOrder.push("database");
      return {
        database: {
          containers: {
            createIfNotExists: async (opts: unknown) => {
              callOrder.push("container");
              return {};
            },
          },
        },
      };
    });

    await initCosmos();
    expect(callOrder).toEqual(["database", "container"]);
  });

  it("propagates errors from database creation", async () => {
    mocks.createIfNotExistsDb.mockRejectedValueOnce(new Error("connection refused"));
    await expect(initCosmos()).rejects.toThrow("connection refused");
  });

  it("propagates errors from container creation", async () => {
    mocks.createIfNotExistsContainer.mockRejectedValueOnce(
      new Error("container creation failed"),
    );
    await expect(initCosmos()).rejects.toThrow("container creation failed");
  });
});
