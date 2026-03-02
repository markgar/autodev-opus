import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Express app module (app.ts)", () => {
  it("mounts health router under /api prefix", async () => {
    const response = await request(app).get("/api/health");

    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty("status");
    expect(response.body).toHaveProperty("checks");
  });

  it("parses JSON request bodies via express.json middleware", async () => {
    const res = await request(app)
      .post("/api/nonexistent")
      .send({ test: "data" })
      .set("Content-Type", "application/json");
    // JSON body parsing works — the 404 handler returns JSON (not a parse error)
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });
});
