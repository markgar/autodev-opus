import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("API 404 handler", () => {
  it("returns 404 JSON for unknown GET /api/* paths", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Not found" });
  });

  it("returns 404 JSON for unknown POST /api/* paths", async () => {
    const res = await request(app).post("/api/unknown-route").send({});
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Not found" });
  });

  it("returns JSON content-type for API 404 responses", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});

describe("API routing integration", () => {
  it("GET /api/health is routed to the health handler (not the 404 handler)", async () => {
    const res = await request(app).get("/api/health");
    // Health endpoint returns 200 when Azure is reachable, 503 when degraded
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("checks");
  });

  it("does not intercept valid /api/health with 404 handler", async () => {
    const [healthRes, unknownRes] = await Promise.all([
      request(app).get("/api/health"),
      request(app).get("/api/nonexistent"),
    ]);
    // Health returns 200 or 503 depending on Azure availability, never 404
    expect([200, 503]).toContain(healthRes.status);
    expect(unknownRes.status).toBe(404);
  });
});
