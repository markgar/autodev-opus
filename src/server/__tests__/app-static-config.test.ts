import { describe, it, expect } from "vitest";
import fs from "node:fs";

describe("app.ts static file serving configuration", () => {
  const source = fs.readFileSync(
    new URL("../app.ts", import.meta.url),
    "utf-8"
  );

  it("serves static files only in non-dev mode", () => {
    expect(source).toContain("express.static");
    expect(source).toContain("IS_DEV");
  });

  it("has SPA catch-all route sending index.html", () => {
    expect(source).toContain("sendFile");
    expect(source).toContain("index.html");
  });

  it("uses Express v5 named splat syntax for catch-all", () => {
    expect(source).toMatch(/\{\*\w+\}/);
  });
});
