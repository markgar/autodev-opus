import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

/* ------------------------------------------------------------------ */
/*  Mock Cosmos and Blob clients used by app.ts route imports          */
/* ------------------------------------------------------------------ */

const mocks = vi.hoisted(() => ({
  fetchAll: vi.fn(),
  read: vi.fn(),
  getDatabaseAccount: vi.fn().mockResolvedValue({}),
  getProperties: vi.fn().mockResolvedValue({}),
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
      listBlobsFlat: () => [],
      getBlobClient: () => ({
        download: vi.fn(),
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

describe("projects API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDatabaseAccount.mockResolvedValue({});
    mocks.getProperties.mockResolvedValue({});
  });

  /* ---------- GET /api/projects (list) ---------- */

  it("GET /api/projects returns 200 with project array", async () => {
    mocks.fetchAll.mockResolvedValue({
      resources: [sampleProject],
    });

    const res = await request(app).get("/api/projects");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: "proj-001",
      name: "My Test Project",
      type: "project",
      organizationId: "default",
    });
  });

  it("GET /api/projects returns empty array when no projects exist", async () => {
    mocks.fetchAll.mockResolvedValue({ resources: [] });

    const res = await request(app).get("/api/projects");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET /api/projects returns 500 when Cosmos DB query fails", async () => {
    mocks.fetchAll.mockRejectedValue(new Error("cosmos unavailable"));

    const res = await request(app).get("/api/projects");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Internal server error" });
  });

  /* ---------- GET /api/projects/:id (get by id) ---------- */

  it("GET /api/projects/:id returns 200 with project when found", async () => {
    mocks.read.mockResolvedValue({ resource: sampleProject });

    const res = await request(app).get("/api/projects/proj-001");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: "proj-001",
      name: "My Test Project",
      specName: "design.md",
      runCount: 3,
    });
  });

  it("GET /api/projects/:id returns 404 when project does not exist (resource null)", async () => {
    mocks.read.mockResolvedValue({ resource: undefined });

    const res = await request(app).get("/api/projects/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Project not found" });
  });

  it("GET /api/projects/:id returns 404 when Cosmos returns 404 error code", async () => {
    const cosmosNotFound = new Error("Entity not found");
    (cosmosNotFound as unknown as Record<string, unknown>).code = 404;
    mocks.read.mockRejectedValue(cosmosNotFound);

    const res = await request(app).get("/api/projects/missing-id");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Project not found" });
  });

  it("GET /api/projects/:id returns 404 when Cosmos returns NotFound string code", async () => {
    const cosmosNotFound = new Error("Entity not found");
    (cosmosNotFound as unknown as Record<string, unknown>).code = "NotFound";
    mocks.read.mockRejectedValue(cosmosNotFound);

    const res = await request(app).get("/api/projects/missing-id");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Project not found" });
  });

  it("GET /api/projects/:id returns 500 when Cosmos throws non-404 error", async () => {
    mocks.read.mockRejectedValue(new Error("connection timeout"));

    const res = await request(app).get("/api/projects/proj-001");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Internal server error" });
  });

  /* ---------- Cross-route integration ---------- */

  it("projects routes coexist with health, sample-specs, and 404 handler", async () => {
    mocks.fetchAll.mockResolvedValue({ resources: [] });

    const [projectsRes, healthRes, notFoundRes] = await Promise.all([
      request(app).get("/api/projects"),
      request(app).get("/api/health"),
      request(app).get("/api/nonexistent-route"),
    ]);

    expect(projectsRes.status).toBe(200);
    expect(projectsRes.body).toEqual([]);
    expect([200, 503]).toContain(healthRes.status);
    expect(notFoundRes.status).toBe(404);
    expect(notFoundRes.body).toEqual({ message: "Not found" });
  });

  it("GET /api/projects returns full project fields matching Project interface", async () => {
    mocks.fetchAll.mockResolvedValue({ resources: [sampleProject] });

    const res = await request(app).get("/api/projects");

    const project = res.body[0];
    expect(project).toHaveProperty("id");
    expect(project).toHaveProperty("organizationId", "default");
    expect(project).toHaveProperty("type", "project");
    expect(project).toHaveProperty("name");
    expect(project).toHaveProperty("specName");
    expect(project).toHaveProperty("createdAt");
    expect(project).toHaveProperty("latestRunStatus");
    expect(project).toHaveProperty("runCount");
  });

  it("GET /api/projects returns multiple projects in order", async () => {
    const projects = [
      { ...sampleProject, id: "proj-a", name: "Project A", createdAt: "2026-03-01T00:00:00Z" },
      { ...sampleProject, id: "proj-b", name: "Project B", createdAt: "2026-02-01T00:00:00Z" },
    ];
    mocks.fetchAll.mockResolvedValue({ resources: projects });

    const res = await request(app).get("/api/projects");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe("proj-a");
    expect(res.body[1].id).toBe("proj-b");
  });
});
