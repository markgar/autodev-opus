import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("main.tsx entry point", () => {
  it("imports React StrictMode for development checks", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "main.tsx"),
      "utf-8"
    );
    expect(source).toContain("StrictMode");
  });

  it("uses createRoot API for React 18+ concurrent rendering", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "main.tsx"),
      "utf-8"
    );
    expect(source).toContain("createRoot");
  });

  it("throws an error if root element is not found", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "main.tsx"),
      "utf-8"
    );
    expect(source).toContain("Root element not found");
  });

  it("imports index.css for Tailwind styles", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "main.tsx"),
      "utf-8"
    );
    expect(source).toContain("index.css");
  });
});
