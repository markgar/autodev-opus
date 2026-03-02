import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("static file serving configuration", () => {
<<<<<<< HEAD
  it("app.ts serves static files in non-dev mode", () => {
=======
  it("server app.ts serves static files in non-dev mode", () => {
>>>>>>> edb4e0b ([validator] Fix broken tests and add milestone-01b validation)
    const source = fs.readFileSync(
      path.join(__dirname, "..", "app.ts"),
      "utf-8"
    );
    expect(source).toContain("express.static");
    expect(source).toContain("IS_DEV");
  });

<<<<<<< HEAD
  it("app.ts has SPA catch-all route for client-side routing", () => {
=======
  it("server app.ts has SPA catch-all route for client-side routing", () => {
>>>>>>> edb4e0b ([validator] Fix broken tests and add milestone-01b validation)
    const source = fs.readFileSync(
      path.join(__dirname, "..", "app.ts"),
      "utf-8"
    );
    // Catch-all route sends index.html for SPA routing
    expect(source).toContain("sendFile");
    expect(source).toContain("index.html");
  });

  it("catch-all route uses Express v5 named splat syntax", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "app.ts"),
      "utf-8"
    );
    // Express v5 requires named parameters: /{*splat} not /*
    expect(source).toMatch(/\{\*\w+\}/);
  });
});
