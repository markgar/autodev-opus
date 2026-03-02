import { describe, it, expect, vi, beforeEach } from "vitest";
import { RestError } from "@azure/storage-blob";
import request from "supertest";

const mocks = vi.hoisted(() => ({
  listBlobsFlat: vi.fn(),
  download: vi.fn(),
  upload: vi.fn(),
  deleteFn: vi.fn(),
  getDatabaseAccount: vi.fn().mockResolvedValue({}),
  getProperties: vi.fn().mockResolvedValue({}),
}));

vi.mock("../azure/blobClient.js", () => ({
  blobServiceClient: {
    getProperties: mocks.getProperties,
    getContainerClient: () => ({
      listBlobsFlat: mocks.listBlobsFlat,
      getBlobClient: () => ({
        download: mocks.download,
        delete: mocks.deleteFn,
      }),
      getBlockBlobClient: () => ({
        upload: mocks.upload,
      }),
    }),
  },
}));

vi.mock("../azure/cosmosClient.js", async () => {
  const { createMockCosmosClient } = await import("./helpers/mockCosmos.js");
  return {
    cosmosClient: createMockCosmosClient({
      getDatabaseAccount: mocks.getDatabaseAccount,
    }),
  };
});

import app from "../app.js";

describe("sample specs — findings #88 and #89", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDatabaseAccount.mockResolvedValue({});
    mocks.getProperties.mockResolvedValue({});
  });

  it("GET /api/sample-specs returns at most 1000 specs (MAX_SPECS limit)", async () => {
    const blobs = Array.from({ length: 1100 }, (_, i) => ({
      name: `spec-${String(i).padStart(4, "0")}.md`,
      properties: {
        contentLength: 100,
        lastModified: new Date("2026-01-01"),
      },
    }));
    mocks.listBlobsFlat.mockReturnValue(blobs);

    const res = await request(app).get("/api/sample-specs");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1000);
  });

  it("GET /api/sample-specs/:name returns 500 when blob download throws non-404 error", async () => {
    mocks.download.mockRejectedValue(
      new RestError("InternalError", { statusCode: 500, code: "InternalError" })
    );

    const res = await request(app).get("/api/sample-specs/test.md");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message");
  });

  it("DELETE /api/sample-specs/:name returns 500 when blob delete throws non-404 error", async () => {
    mocks.deleteFn.mockRejectedValue(
      new RestError("InternalError", { statusCode: 500, code: "InternalError" })
    );

    const res = await request(app).delete("/api/sample-specs/test.md");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message");
  });
});
