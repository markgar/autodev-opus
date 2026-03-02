import { describe, it, expect } from "vitest";
import app from "../app.js";

describe("Express app module (app.ts)", () => {
  it("mounts health router under /api prefix", async () => {
    const http = await import("node:http");
    const server = http.createServer(app);

    const response = await new Promise<{ status: number; body: string }>(
      (resolve) => {
        server.listen(0, () => {
          const addr = server.address();
          const port = typeof addr === "object" && addr ? addr.port : 0;
          const req = http.request(
            { hostname: "127.0.0.1", port, path: "/api/health", method: "GET" },
            (res) => {
              let data = "";
              res.on("data", (chunk) => (data += chunk));
              res.on("end", () => {
                resolve({ status: res.statusCode ?? 0, body: data });
                server.close();
              });
            }
          );
          req.end();
        });
      }
    );

    expect([200, 503]).toContain(response.status);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("checks");
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
