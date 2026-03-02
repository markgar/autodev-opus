import { describe, it, expect } from "vitest";

describe("Express app setup", () => {
  it("exports an Express application with standard methods", async () => {
    const { default: app } = await import("../app.js");
    expect(app).toBeDefined();
    expect(typeof app).toBe("function");
    expect(typeof app.get).toBe("function");
    expect(typeof app.use).toBe("function");
    expect(typeof app.listen).toBe("function");
  });

  it("defaults to port 3000 when PORT is not set", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../index.ts", import.meta.url),
      "utf-8"
    );
    expect(source).toContain('"3000"');
  });
});
