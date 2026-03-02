import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "..", "..");

describe("test infrastructure", () => {
  it("server vitest config uses node environment", () => {
    const config = fs.readFileSync(
      path.join(rootDir, "src", "server", "vitest.config.ts"),
      "utf-8"
    );
    expect(config).toContain('environment: "node"');
    expect(config).toContain("src/server");
  });

  it("client vitest config uses jsdom environment with setup file", () => {
    const config = fs.readFileSync(
      path.join(rootDir, "src", "client", "vitest.config.ts"),
      "utf-8"
    );
    expect(config).toContain('environment: "jsdom"');
    expect(config).toContain("test-setup.ts");
  });

  it("test-setup.ts imports jest-dom matchers for vitest", () => {
    const setup = fs.readFileSync(
      path.join(rootDir, "src", "client", "test-setup.ts"),
      "utf-8"
    );
    expect(setup).toContain("@testing-library/jest-dom");
  });

  it("package.json has test:server and test:client scripts", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(rootDir, "package.json"), "utf-8")
    );
    expect(pkg.scripts["test:server"]).toBeDefined();
    expect(pkg.scripts["test:client"]).toBeDefined();
    expect(pkg.scripts["test"]).toBeDefined();
  });
});
