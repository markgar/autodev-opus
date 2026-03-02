import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configSource = fs.readFileSync(
  path.join(__dirname, "..", "..", "..", "vite.config.ts"),
  "utf-8"
);

describe("Vite configuration", () => {
  it("sets client as root directory", () => {
    expect(configSource).toContain('"src/client"');
  });

  it("includes React and Tailwind plugins", () => {
    expect(configSource).toContain("react()");
    expect(configSource).toContain("tailwindcss()");
  });

  it("outputs to dist/client directory", () => {
    expect(configSource).toContain("dist/client");
  });

  it("configures API proxy for dev server", () => {
    expect(configSource).toContain("/api");
    expect(configSource).toContain("localhost");
  });
});
