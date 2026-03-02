import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

/* ------------------------------------------------------------------ */
/*  Mock Cosmos and Blob clients for POST /api/projects tests          */
/* ------------------------------------------------------------------ */

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  fetchAll: vi.fn().mockResolvedValue({ resources: [] }),
  read: vi.fn(),
  getDatabaseAccount: vi.fn().mockResolvedValue({}),
  getProperties: vi.fn().mockResolvedValue({}),
  createIfNotExists: vi.fn().mockResolvedValue({}),
}));

vi.mock("../azure/cosmosClient.js", () => ({
  cosmosClient: {
    getDatabaseAccount: mocks.getDatabaseAccount,
    database: () => ({
      container: () => ({
        items: {
          create: mocks.create,
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
      createIfNotExists: mocks.createIfNotExists,
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

describe("POST /api/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDatabaseAccount.mockResolvedValue({});
    mocks.getProperties.mockResolvedValue({});
    mocks.create.mockResolvedValue({});
    mocks.createIfNotExists.mockResolvedValue({});
  });

  it("returns 201 with all project fields on valid input", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ name: "Test Project", specName: "design.md" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: "Test Project",
      specName: "design.md",
      organizationId: "default",
      type: "project",
      runCount: 0,
      latestRunStatus: null,
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  it("stores the project in Cosmos DB via items.create", async () => {
    await request(app)
      .post("/api/projects")
      .send({ name: "My App", specName: "spec.md" });

    expect(mocks.create).toHaveBeenCalledTimes(1);
    const created = mocks.create.mock.calls[0][0];
    expect(created.name).toBe("My App");
    expect(created.specName).toBe("spec.md");
    expect(created.organizationId).toBe("default");
    expect(created.type).toBe("project");
  });

  it("provisions a blob container for the new project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ name: "Blob Test", specName: "spec.md" });

    expect(res.status).toBe(201);
    expect(mocks.createIfNotExists).toHaveBeenCalledTimes(1);
  });

  it("returns 400 when body is empty", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ specName: "design.md" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name/i);
  });

  it("returns 400 when name is an empty string", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ name: "", specName: "design.md" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name/i);
  });

  it("returns 400 when name is whitespace only", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ name: "   ", specName: "design.md" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name/i);
  });

  it("returns 400 when name exceeds 100 characters", async () => {
    const longName = "a".repeat(101);
    const res = await request(app)
      .post("/api/projects")
      .send({ name: longName, specName: "design.md" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/100/);
  });

  it("accepts name with exactly 100 characters", async () => {
    const exactName = "a".repeat(100);
    const res = await request(app)
      .post("/api/projects")
      .send({ name: exactName, specName: "design.md" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(exactName);
  });

  it("returns 400 when specName is missing", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ name: "Valid Name" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/specName/i);
  });

  it("returns 400 when specName is an empty string", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ name: "Valid Name", specName: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/specName/i);
  });

  it("returns 500 when Cosmos DB create fails", async () => {
    mocks.create.mockRejectedValue(new Error("cosmos write failed"));

    const res = await request(app)
      .post("/api/projects")
      .send({ name: "Fail Project", specName: "design.md" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });

  it("returns 500 when blob container creation fails", async () => {
    mocks.createIfNotExists.mockRejectedValue(new Error("blob unavailable"));

    const res = await request(app)
      .post("/api/projects")
      .send({ name: "Blob Fail", specName: "design.md" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });

  it("trims leading/trailing whitespace from name", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ name: "  Trimmed Name  ", specName: "design.md" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Trimmed Name");
  });

  it("generates a unique id for each created project", async () => {
    const res1 = await request(app)
      .post("/api/projects")
      .send({ name: "Project A", specName: "a.md" });
    const res2 = await request(app)
      .post("/api/projects")
      .send({ name: "Project B", specName: "b.md" });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res1.body.id).not.toBe(res2.body.id);
  });
});

describe("project creation → retrieval lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDatabaseAccount.mockResolvedValue({});
    mocks.getProperties.mockResolvedValue({});
    mocks.create.mockResolvedValue({});
    mocks.createIfNotExists.mockResolvedValue({});
  });

  it("POST project then GET /api/projects lists it", async () => {
    const createRes = await request(app)
      .post("/api/projects")
      .send({ name: "Listed Project", specName: "spec.md" });
    expect(createRes.status).toBe(201);

    const created = createRes.body;
    mocks.fetchAll.mockResolvedValue({ resources: [created] });

    const listRes = await request(app).get("/api/projects");
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].id).toBe(created.id);
    expect(listRes.body[0].name).toBe("Listed Project");
  });

  it("POST project then GET /api/projects/:id returns it", async () => {
    const createRes = await request(app)
      .post("/api/projects")
      .send({ name: "Fetched Project", specName: "spec.md" });
    expect(createRes.status).toBe(201);

    const created = createRes.body;
    mocks.read.mockResolvedValue({ resource: created });

    const getRes = await request(app).get(`/api/projects/${created.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body).toMatchObject({
      id: created.id,
      name: "Fetched Project",
      specName: "spec.md",
      organizationId: "default",
      type: "project",
    });
  });
});
