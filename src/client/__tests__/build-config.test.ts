import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(clientDir, "index.html"), "utf-8");

describe("client build configuration", () => {
  it("index.html has a root div for React mounting", () => {
    expect(html).toContain('id="root"');
  });

  it("index.html loads main.tsx as a module script", () => {
    expect(html).toContain('type="module"');
    expect(html).toContain("main.tsx");
  });

  it("index.html has proper meta tags", () => {
    expect(html).toContain('charset="UTF-8"');
    expect(html).toContain("viewport");
  });

  it("index.css imports Tailwind CSS", () => {
    const css = fs.readFileSync(path.join(clientDir, "index.css"), "utf-8");
    expect(css).toContain("tailwindcss");
  });
});
