import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

/* ------------------------------------------------------------------ */
/*  Mock Azure clients                                                 */
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

vi.mock("../azure/cosmosClient.js", () => ({
  cosmosClient: {
    getDatabaseAccount: mocks.getDatabaseAccount,
    database: () => ({
      container: () => ({
        items: { query: () => ({ fetchAll: vi.fn().mockResolvedValue({ resources: [] }) }) },
        item: () => ({ read: vi.fn().mockResolvedValue({ resource: null }) }),
      }),
    }),
  },
}));

import app from "../app.js";
import { isValidSpecName } from "../services/sampleSpecs.js";

describe("sample specs — path traversal validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDatabaseAccount.mockResolvedValue({});
    mocks.getProperties.mockResolvedValue({});
  });

  it("GET /api/sample-specs/../etc/passwd returns 400", async () => {
    // Express normalizes .. in paths, so we use an encoded pattern
    const res = await request(app).get("/api/sample-specs/..%2Fetc%2Fpasswd");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("DELETE /api/sample-specs/foo/../bar.md returns 400", async () => {
    const res = await request(app).delete("/api/sample-specs/foo%2F..%2Fbar.md");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("GET /api/sample-specs with name containing slashes returns 400", async () => {
    const res = await request(app).get("/api/sample-specs/sub%2Fdir%2Fspec.md");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });
});

describe("sample specs — additional validation edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDatabaseAccount.mockResolvedValue({});
    mocks.getProperties.mockResolvedValue({});
  });

  it("POST /api/sample-specs returns 400 when content field is missing entirely", async () => {
    const res = await request(app)
      .post("/api/sample-specs")
      .send({ name: "nocontent.md" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/content/i);
  });

  it("POST /api/sample-specs returns 400 when body is completely empty", async () => {
    const res = await request(app)
      .post("/api/sample-specs")
      .send({});

    expect(res.status).toBe(400);
  });

  it("POST /api/sample-specs returns 400 when name contains dots-only traversal", async () => {
    const res = await request(app)
      .post("/api/sample-specs")
      .send({ name: "..md", content: "# Evil" });

    expect(res.status).toBe(400);
  });
});

describe("isValidSpecName — additional patterns", () => {
  it("rejects names containing forward slashes", () => {
    expect(isValidSpecName("sub/dir/spec.md")).toBe(false);
  });

  it("rejects names containing backslashes", () => {
    expect(isValidSpecName("sub\\dir\\spec.md")).toBe(false);
  });

  it("rejects null bytes in names", () => {
    expect(isValidSpecName("spec\x00.md")).toBe(false);
  });

  it("accepts maximum valid length name (254 chars total)", () => {
    // Regex: 1 start char + up to 250 middle chars + ".md" (3 chars) = 254 max
    const name = "a" + "b".repeat(250) + ".md";
    expect(name.length).toBe(254);
    expect(isValidSpecName(name)).toBe(true);
  });
});
