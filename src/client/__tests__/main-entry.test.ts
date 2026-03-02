import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainSource = fs.readFileSync(
  path.join(__dirname, "..", "main.tsx"),
  "utf-8"
);

describe("main.tsx entry point", () => {
  it("imports React StrictMode for development checks", () => {
    expect(mainSource).toContain("StrictMode");
  });

  it("uses createRoot API for React 18+ concurrent rendering", () => {
    expect(mainSource).toContain("createRoot");
  });

  it("throws an error if root element is not found", () => {
    expect(mainSource).toContain("Root element not found");
  });

  it("imports index.css for Tailwind styles", () => {
    expect(mainSource).toContain("index.css");
  });
});
