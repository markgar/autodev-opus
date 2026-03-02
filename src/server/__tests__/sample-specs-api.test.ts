import { describe, it, expect, vi, beforeEach } from "vitest";
import { Readable } from "node:stream";
import { RestError } from "@azure/storage-blob";
import request from "supertest";

/* ------------------------------------------------------------------ */
/*  Mock the blob client used by the sample-specs service + routes    */
/* ------------------------------------------------------------------ */

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

function makeBlobNotFoundError(): RestError {
  return new RestError("BlobNotFound", { statusCode: 404, code: "BlobNotFound" });
}

vi.mock("../azure/cosmosClient.js", async () => {
  const { createMockCosmosClient } = await import("./helpers/mockCosmos.js");
  return {
    cosmosClient: createMockCosmosClient({
      getDatabaseAccount: mocks.getDatabaseAccount,
    }),
  };
});

import app from "../app.js";
import { isValidSpecName } from "../services/sampleSpecs.js";

describe("isValidSpecName", () => {
  it("accepts simple .md filenames", () => {
    expect(isValidSpecName("design.md")).toBe(true);
    expect(isValidSpecName("my-spec_v2.md")).toBe(true);
    expect(isValidSpecName("A1.md")).toBe(true);
  });

  it("rejects path traversal patterns", () => {
    expect(isValidSpecName("../../evil.md")).toBe(false);
    expect(isValidSpecName("foo/../bar.md")).toBe(false);
  });

  it("rejects names without .md extension", () => {
    expect(isValidSpecName("readme.txt")).toBe(false);
    expect(isValidSpecName("noext")).toBe(false);
  });

  it("rejects names starting with non-alphanumeric", () => {
    expect(isValidSpecName(".hidden.md")).toBe(false);
    expect(isValidSpecName("-dash.md")).toBe(false);
  });

  it("rejects names over 255 chars", () => {
    const longName = "a".repeat(253) + ".md";
    expect(isValidSpecName(longName)).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidSpecName("")).toBe(false);
  });
});

describe("sample specs CRUD API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDatabaseAccount.mockResolvedValue({});
    mocks.getProperties.mockResolvedValue({});
  });

  /* ---------- GET /api/sample-specs (list) ---------- */

  it("GET /api/sample-specs returns 200 with spec entries", async () => {
    const blobs = [
      {
        name: "design.md",
        properties: {
          contentLength: 128,
          lastModified: new Date("2026-01-15T10:00:00Z"),
        },
      },
      {
        name: "requirements.md",
        properties: {
          contentLength: 256,
          lastModified: new Date("2026-02-20T12:00:00Z"),
        },
      },
    ];
    mocks.listBlobsFlat.mockReturnValue(blobs);

    const res = await request(app).get("/api/sample-specs");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toEqual({
      name: "design.md",
      size: 128,
      lastModified: "2026-01-15T10:00:00.000Z",
    });
    expect(res.body[1].name).toBe("requirements.md");
  });

  it("GET /api/sample-specs returns empty array when no specs exist", async () => {
    mocks.listBlobsFlat.mockReturnValue([]);

    const res = await request(app).get("/api/sample-specs");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET /api/sample-specs returns 500 when blob storage fails", async () => {
    mocks.listBlobsFlat.mockImplementation(function* () {
      throw new Error("storage unreachable");
    });

    const res = await request(app).get("/api/sample-specs");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message");
  });

  /* ---------- GET /api/sample-specs/:name (read) ---------- */

  it("GET /api/sample-specs/:name returns 200 with markdown content", async () => {
    const body = Readable.from(Buffer.from("# Hello World"));
    mocks.download.mockResolvedValue({ readableStreamBody: body });

    const res = await request(app).get("/api/sample-specs/test.md");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/markdown/);
    expect(res.text).toBe("# Hello World");
  });

  it("GET /api/sample-specs/:name returns 404 when spec not found", async () => {
    mocks.download.mockRejectedValue(makeBlobNotFoundError());

    const res = await request(app).get("/api/sample-specs/missing.md");

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("not found");
  });

  it("GET /api/sample-specs/:name returns 400 for invalid name", async () => {
    const res = await request(app).get("/api/sample-specs/.hidden.md");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  /* ---------- POST /api/sample-specs (create) ---------- */

  it("POST /api/sample-specs creates spec and returns 201", async () => {
    mocks.upload.mockResolvedValue({});

    const res = await request(app)
      .post("/api/sample-specs")
      .send({ name: "new-spec.md", content: "# New Spec" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ name: "new-spec.md" });
    expect(mocks.upload).toHaveBeenCalled();
  });

  it("POST /api/sample-specs returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/sample-specs")
      .send({ content: "# Hello" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name/i);
  });

  it("POST /api/sample-specs returns 400 when name does not end with .md", async () => {
    const res = await request(app)
      .post("/api/sample-specs")
      .send({ name: "readme.txt", content: "# Hello" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/\.md/);
  });

  it("POST /api/sample-specs returns 400 for path traversal name", async () => {
    const res = await request(app)
      .post("/api/sample-specs")
      .send({ name: "../../evil.md", content: "# Evil" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("POST /api/sample-specs returns 400 when content is empty", async () => {
    const res = await request(app)
      .post("/api/sample-specs")
      .send({ name: "empty.md", content: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/content/i);
  });

  it("POST /api/sample-specs returns 400 when content is whitespace-only", async () => {
    const res = await request(app)
      .post("/api/sample-specs")
      .send({ name: "blank.md", content: "   \n  " });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/content/i);
  });

  it("POST /api/sample-specs returns 500 when upload fails", async () => {
    mocks.upload.mockRejectedValue(new Error("storage write error"));

    const res = await request(app)
      .post("/api/sample-specs")
      .send({ name: "fail.md", content: "# Will Fail" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message");
  });

  /* ---------- DELETE /api/sample-specs/:name ---------- */

  it("DELETE /api/sample-specs/:name returns 204 on success", async () => {
    mocks.deleteFn.mockResolvedValue({});

    const res = await request(app).delete("/api/sample-specs/old.md");

    expect(res.status).toBe(204);
    expect(mocks.deleteFn).toHaveBeenCalled();
  });

  it("DELETE /api/sample-specs/:name returns 404 when spec not found", async () => {
    mocks.deleteFn.mockRejectedValue(makeBlobNotFoundError());

    const res = await request(app).delete("/api/sample-specs/ghost.md");

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("not found");
  });

  it("DELETE /api/sample-specs/:name returns 400 for invalid name", async () => {
    const res = await request(app).delete("/api/sample-specs/.hidden.md");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  /* ---------- Route integration ---------- */

  it("sample specs routes coexist with health and 404 routes", async () => {
    mocks.listBlobsFlat.mockReturnValue([]);

    const [specsRes, healthRes, notFoundRes] = await Promise.all([
      request(app).get("/api/sample-specs"),
      request(app).get("/api/health"),
      request(app).get("/api/nonexistent"),
    ]);

    expect(specsRes.status).toBe(200);
    expect([200, 503]).toContain(healthRes.status);
    expect(notFoundRes.status).toBe(404);
  });

  /* ---------- CRUD lifecycle ---------- */

  it("full lifecycle: upload → list → get → delete → verify gone", async () => {
    // Upload
    mocks.upload.mockResolvedValue({});
    const createRes = await request(app)
      .post("/api/sample-specs")
      .send({ name: "lifecycle.md", content: "# Lifecycle Test" });
    expect(createRes.status).toBe(201);

    // List (has the spec)
    mocks.listBlobsFlat.mockReturnValue([
      {
        name: "lifecycle.md",
        properties: { contentLength: 16, lastModified: new Date() },
      },
    ]);
    const listRes = await request(app).get("/api/sample-specs");
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].name).toBe("lifecycle.md");

    // Get content
    const body = Readable.from(Buffer.from("# Lifecycle Test"));
    mocks.download.mockResolvedValue({ readableStreamBody: body });
    const getRes = await request(app).get("/api/sample-specs/lifecycle.md");
    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe("# Lifecycle Test");

    // Delete
    mocks.deleteFn.mockResolvedValue({});
    const delRes = await request(app).delete("/api/sample-specs/lifecycle.md");
    expect(delRes.status).toBe(204);

    // Verify list is now empty
    mocks.listBlobsFlat.mockReturnValue([]);
    const emptyListRes = await request(app).get("/api/sample-specs");
    expect(emptyListRes.body).toEqual([]);
  });
});
