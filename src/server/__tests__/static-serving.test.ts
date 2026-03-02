import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("static file serving configuration", () => {
  it("server index.ts serves static files in non-dev mode", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "index.ts"),
      "utf-8"
    );
    expect(source).toContain("express.static");
    expect(source).toContain("IS_DEV");
  });

  it("server index.ts has SPA catch-all route for client-side routing", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "index.ts"),
      "utf-8"
    );
    // Catch-all route sends index.html for SPA routing
    expect(source).toContain("sendFile");
    expect(source).toContain("index.html");
  });

  it("catch-all route uses Express v5 named splat syntax", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "index.ts"),
      "utf-8"
    );
    // Express v5 requires named parameters: /{*splat} not /*
    expect(source).toMatch(/\{\*\w+\}/);
  });
});
