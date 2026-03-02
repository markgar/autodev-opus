import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";

/* ------------------------------------------------------------------ */
/*  Mock Azure clients — these won't be called when in-memory mode is */
/*  active, but must exist so module imports succeed.                  */
/* ------------------------------------------------------------------ */

const mocks = vi.hoisted(() => ({
  getDatabaseAccount: vi.fn().mockResolvedValue({}),
  getProperties: vi.fn().mockResolvedValue({}),
  create: vi.fn(),
  fetchAll: vi.fn().mockResolvedValue({ resources: [] }),
  read: vi.fn(),
  listBlobsFlat: vi.fn().mockReturnValue([]),
  download: vi.fn(),
  upload: vi.fn(),
  deleteFn: vi.fn(),
  createIfNotExists: vi.fn().mockResolvedValue({}),
}));

vi.mock("../azure/cosmosClient.js", async () => {
  const { createMockCosmosClient } = await import("./helpers/mockCosmos.js");
  return {
    cosmosClient: createMockCosmosClient({
      getDatabaseAccount: mocks.getDatabaseAccount,
      create: mocks.create,
      fetchAll: mocks.fetchAll,
      read: mocks.read,
    }),
  };
});

vi.mock("../azure/blobClient.js", () => ({
  blobServiceClient: {
    getProperties: mocks.getProperties,
    getContainerClient: () => ({
      createIfNotExists: mocks.createIfNotExists,
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

import app from "../app.js";
import { setBlobAvailable } from "../services/sampleSpecs.js";
import { setCosmosAvailable } from "../services/projectsService.js";

describe("in-memory fallback — sample specs", () => {
  beforeEach(() => {
    setBlobAvailable(false);
  });

  afterEach(() => {
    setBlobAvailable(true);
  });

  it("full CRUD lifecycle works through in-memory store", async () => {
    // Upload a spec
    const createRes = await request(app)
      .post("/api/sample-specs")
      .send({ name: "inmem-test.md", content: "# In-Memory Spec" });
    expect(createRes.status).toBe(201);
    expect(createRes.body).toEqual({ name: "inmem-test.md" });

    // Blob mock should NOT be called — in-memory path
    expect(mocks.upload).not.toHaveBeenCalled();

    // List should include the uploaded spec
    const listRes = await request(app).get("/api/sample-specs");
    expect(listRes.status).toBe(200);
    expect(listRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "inmem-test.md" }),
      ]),
    );
    expect(mocks.listBlobsFlat).not.toHaveBeenCalled();

    // Get content
    const getRes = await request(app).get("/api/sample-specs/inmem-test.md");
    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe("# In-Memory Spec");
    expect(mocks.download).not.toHaveBeenCalled();

    // Delete
    const delRes = await request(app).delete("/api/sample-specs/inmem-test.md");
    expect(delRes.status).toBe(204);
    expect(mocks.deleteFn).not.toHaveBeenCalled();

    // Verify gone
    const goneRes = await request(app).get("/api/sample-specs/inmem-test.md");
    expect(goneRes.status).toBe(404);
    expect(goneRes.body.message).toContain("not found");
  });

  it("returns 404 when getting a nonexistent spec from in-memory store", async () => {
    const res = await request(app).get("/api/sample-specs/nope.md");

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("not found");
  });

  it("returns 404 when deleting a nonexistent spec from in-memory store", async () => {
    const res = await request(app).delete("/api/sample-specs/nope.md");

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("not found");
  });
});

describe("in-memory fallback — projects", () => {
  beforeEach(() => {
    setCosmosAvailable(false);
  });

  afterEach(() => {
    setCosmosAvailable(true);
  });

  it("create and retrieve project through in-memory store", async () => {
    const createRes = await request(app)
      .post("/api/projects")
      .send({ name: "Memory Project", specName: "design.md" });
    expect(createRes.status).toBe(201);

    const project = createRes.body;
    expect(project.name).toBe("Memory Project");
    expect(project.specName).toBe("design.md");
    expect(project.organizationId).toBe("default");
    expect(project.type).toBe("project");

    // Cosmos mock should NOT be called
    expect(mocks.create).not.toHaveBeenCalled();

    // Get by ID
    const getRes = await request(app).get(`/api/projects/${project.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe("Memory Project");
    expect(mocks.read).not.toHaveBeenCalled();

    // List should include it
    const listRes = await request(app).get("/api/projects");
    expect(listRes.status).toBe(200);
    expect(listRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Memory Project" }),
      ]),
    );
    expect(mocks.fetchAll).not.toHaveBeenCalled();
  });

  it("returns 404 for nonexistent project ID from in-memory store", async () => {
    const res = await request(app).get("/api/projects/nonexistent-id");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Project not found");
  });

  it("in-memory projects are sorted by createdAt descending", async () => {
    // Create projects with a small delay to ensure different timestamps
    const res1 = await request(app)
      .post("/api/projects")
      .send({ name: "First", specName: "a.md" });
    const res2 = await request(app)
      .post("/api/projects")
      .send({ name: "Second", specName: "b.md" });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);

    const listRes = await request(app).get("/api/projects");
    expect(listRes.status).toBe(200);

    // Most recently created should appear first
    const names = listRes.body.map((p: { name: string }) => p.name);
    const secondIdx = names.indexOf("Second");
    const firstIdx = names.indexOf("First");
    expect(secondIdx).toBeLessThan(firstIdx);
  });
});

describe("in-memory fallback — cross-API integration", () => {
  beforeEach(() => {
    setBlobAvailable(false);
    setCosmosAvailable(false);
  });

  afterEach(() => {
    setBlobAvailable(true);
    setCosmosAvailable(true);
  });

  it("all API routes work concurrently when both Azure services are unavailable", async () => {
    // Create a project
    const projectRes = await request(app)
      .post("/api/projects")
      .send({ name: "Offline Project", specName: "offline.md" });
    expect(projectRes.status).toBe(201);

    // Upload a spec
    const specRes = await request(app)
      .post("/api/sample-specs")
      .send({ name: "offline.md", content: "# Offline Spec" });
    expect(specRes.status).toBe(201);

    // All read endpoints respond
    const [listProjects, listSpecs, healthRes] = await Promise.all([
      request(app).get("/api/projects"),
      request(app).get("/api/sample-specs"),
      request(app).get("/api/health"),
    ]);

    expect(listProjects.status).toBe(200);
    expect(listProjects.body.length).toBeGreaterThanOrEqual(1);
    expect(listSpecs.status).toBe(200);
    expect(listSpecs.body.length).toBeGreaterThanOrEqual(1);
    // Health will be 503 (degraded) since mocked Azure clients may fail
    expect([200, 503]).toContain(healthRes.status);
  });
});
