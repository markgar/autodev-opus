import { describe, it, expect, vi, beforeEach } from "vitest";
import { Readable } from "node:stream";
import { RestError } from "@azure/storage-blob";
import request from "supertest";

/* ------------------------------------------------------------------ */
/*  Mock Cosmos and Blob clients for logs API tests                    */
/* ------------------------------------------------------------------ */

const mocks = vi.hoisted(() => ({
  read: vi.fn(),
  fetchAll: vi.fn().mockResolvedValue({ resources: [] }),
  getDatabaseAccount: vi.fn().mockResolvedValue({}),
  getProperties: vi.fn().mockResolvedValue({}),
  listBlobsFlat: vi.fn(),
  download: vi.fn(),
}));

vi.mock("../azure/cosmosClient.js", () => ({
  cosmosClient: {
    getDatabaseAccount: mocks.getDatabaseAccount,
    database: () => ({
      container: () => ({
        items: {
          query: () => ({ fetchAll: mocks.fetchAll }),
        },
        item: () => ({ read: mocks.read }),
      }),
    }),
  },
}));

vi.mock("../azure/blobClient.js", () => ({
  blobServiceClient: {
    getProperties: mocks.getProperties,
    getContainerClient: () => ({
      listBlobsFlat: mocks.listBlobsFlat,
      getBlobClient: () => ({
        download: mocks.download,
        delete: vi.fn(),
      }),
      getBlockBlobClient: () => ({
        upload: vi.fn(),
      }),
    }),
  },
}));

import app from "../app.js";

const sampleProject = {
  id: "proj-001",
  organizationId: "default",
  type: "project" as const,
  name: "My Test Project",
  specName: "design.md",
  createdAt: "2026-02-01T10:00:00Z",
  latestRunStatus: "succeeded" as const,
  runCount: 3,
};

function makeReadableStream(content: string): Readable {
  return Readable.from(Buffer.from(content));
}

function makeContainerNotFoundError(): RestError {
  return new RestError("ContainerNotFound", {
    statusCode: 404,
    code: "ContainerNotFound",
  });
}

describe("logs API — GET /api/projects/:id/logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDatabaseAccount.mockResolvedValue({});
    mocks.getProperties.mockResolvedValue({});
  });

  it("returns 404 when project does not exist", async () => {
    mocks.read.mockResolvedValue({ resource: undefined });

    const res = await request(app).get("/api/projects/nonexistent/logs");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Project not found" });
  });

  it("returns empty lines when blob container does not exist", async () => {
    mocks.read.mockResolvedValue({ resource: sampleProject });
    mocks.listBlobsFlat.mockImplementation(function* () {
      throw makeContainerNotFoundError();
    });

    const res = await request(app).get("/api/projects/proj-001/logs");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ lines: [] });
  });

  it("returns log lines from .log and events.jsonl blobs", async () => {
    mocks.read.mockResolvedValue({ resource: sampleProject });
    mocks.listBlobsFlat.mockReturnValue([
      { name: "build.log", properties: { lastModified: new Date("2026-01-01T00:00:00Z") } },
      { name: "events.jsonl", properties: { lastModified: new Date("2026-01-01T00:01:00Z") } },
    ]);
    mocks.download
      .mockResolvedValueOnce({
        readableStreamBody: makeReadableStream("line1\nline2\n"),
      })
      .mockResolvedValueOnce({
        readableStreamBody: makeReadableStream('{"event":"start"}\n'),
      });

    const res = await request(app).get("/api/projects/proj-001/logs");

    expect(res.status).toBe(200);
    expect(res.body.lines).toHaveLength(3);
    expect(res.body.lines).toContain("line1");
    expect(res.body.lines).toContain("line2");
    expect(res.body.lines).toContain('{"event":"start"}');
  });

  it("returns empty lines when container has no matching blobs", async () => {
    mocks.read.mockResolvedValue({ resource: sampleProject });
    mocks.listBlobsFlat.mockReturnValue([
      { name: "readme.txt", properties: { lastModified: new Date() } },
      { name: "data.json", properties: { lastModified: new Date() } },
    ]);

    const res = await request(app).get("/api/projects/proj-001/logs");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ lines: [] });
  });

  it("skips individual blob 404 errors and returns remaining lines", async () => {
    mocks.read.mockResolvedValue({ resource: sampleProject });
    mocks.listBlobsFlat.mockReturnValue([
      { name: "build.log", properties: { lastModified: new Date("2026-01-01T00:00:00Z") } },
      { name: "deploy.log", properties: { lastModified: new Date("2026-01-01T00:01:00Z") } },
    ]);
    mocks.download
      .mockRejectedValueOnce(
        new RestError("BlobNotFound", { statusCode: 404, code: "BlobNotFound" })
      )
      .mockResolvedValueOnce({
        readableStreamBody: makeReadableStream("deploy line 1\n"),
      });

    const res = await request(app).get("/api/projects/proj-001/logs");

    expect(res.status).toBe(200);
    expect(res.body.lines).toEqual(["deploy line 1"]);
  });

  it("returns 500 when an unexpected blob storage error occurs", async () => {
    mocks.read.mockResolvedValue({ resource: sampleProject });
    mocks.listBlobsFlat.mockImplementation(function* () {
      throw new Error("storage timeout");
    });

    const res = await request(app).get("/api/projects/proj-001/logs");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 500 when Cosmos DB throws non-404 error", async () => {
    mocks.read.mockRejectedValue(new Error("connection refused"));

    const res = await request(app).get("/api/projects/proj-001/logs");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message");
  });
});
