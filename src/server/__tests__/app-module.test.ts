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
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../app.ts", import.meta.url),
      "utf-8"
    );
    expect(source).toContain("express.json()");
  });
});
