import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Vite configuration", () => {
  it("sets client as root directory", () => {
    const config = fs.readFileSync(
      path.join(__dirname, "..", "..", "..", "vite.config.ts"),
      "utf-8"
    );
    expect(config).toContain('"src/client"');
  });

  it("includes React and Tailwind plugins", () => {
    const config = fs.readFileSync(
      path.join(__dirname, "..", "..", "..", "vite.config.ts"),
      "utf-8"
    );
    expect(config).toContain("react()");
    expect(config).toContain("tailwindcss()");
  });

  it("outputs to dist/client directory", () => {
    const config = fs.readFileSync(
      path.join(__dirname, "..", "..", "..", "vite.config.ts"),
      "utf-8"
    );
    expect(config).toContain("dist/client");
  });

  it("configures API proxy for dev server", () => {
    const config = fs.readFileSync(
      path.join(__dirname, "..", "..", "..", "vite.config.ts"),
      "utf-8"
    );
    expect(config).toContain("/api");
<<<<<<< HEAD
    expect(config).toContain("localhost:");
=======
    expect(config).toContain("localhost");
    expect(config).toContain("3000");
>>>>>>> edb4e0b ([validator] Fix broken tests and add milestone-01b validation)
  });
});
