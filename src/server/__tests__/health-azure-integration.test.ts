import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const mocks = vi.hoisted(() => ({
  getDatabaseAccount: vi.fn(),
  getProperties: vi.fn(),
}));

vi.mock("../azure/cosmosClient.js", async () => {
  const { createMockCosmosClient } = await import("./helpers/mockCosmos.js");
  return {
    cosmosClient: createMockCosmosClient({
      getDatabaseAccount: mocks.getDatabaseAccount,
    }),
  };
});

vi.mock("../azure/blobClient.js", () => ({
  blobServiceClient: { getProperties: mocks.getProperties },
}));

import app from "../app.js";

describe("health endpoint Azure integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 ok when both Cosmos DB and Blob Storage are connected", async () => {
    mocks.getDatabaseAccount.mockResolvedValue({});
    mocks.getProperties.mockResolvedValue({});

    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      checks: { cosmosDb: "connected", blobStorage: "connected" },
    });
  });

  it("returns 503 degraded when Cosmos DB is unavailable", async () => {
    mocks.getDatabaseAccount.mockRejectedValue(new Error("cosmos down"));
    mocks.getProperties.mockResolvedValue({});

    const res = await request(app).get("/api/health");
    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      status: "degraded",
      checks: { cosmosDb: "unavailable", blobStorage: "connected" },
    });
  });

  it("returns 503 degraded when Blob Storage is unavailable", async () => {
    mocks.getDatabaseAccount.mockResolvedValue({});
    mocks.getProperties.mockRejectedValue(new Error("blob down"));

    const res = await request(app).get("/api/health");
    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      status: "degraded",
      checks: { cosmosDb: "connected", blobStorage: "unavailable" },
    });
  });

  it("returns 503 degraded when both services are unavailable", async () => {
    mocks.getDatabaseAccount.mockRejectedValue(new Error("cosmos down"));
    mocks.getProperties.mockRejectedValue(new Error("blob down"));

    const res = await request(app).get("/api/health");
    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      status: "degraded",
      checks: { cosmosDb: "unavailable", blobStorage: "unavailable" },
    });
  });
});
