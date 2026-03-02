import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import healthRouter from "../routes/health.js";

const testApp = express();
testApp.use("/api", healthRouter);

describe("health route behavior", () => {
  it("responds with structured health check response", async () => {
    const res = await request(testApp).get("/api/health");

    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("checks");
    expect(res.body.checks).toHaveProperty("cosmosDb");
    expect(res.body.checks).toHaveProperty("blobStorage");
    expect(["ok", "degraded"]).toContain(res.body.status);
  });

  it("only responds to GET requests", async () => {
    const getRes = await request(testApp).get("/api/health");
    expect(getRes.status).not.toBe(404);

    const postRes = await request(testApp).post("/api/health");
    expect(postRes.status).toBe(404);
  });
});
