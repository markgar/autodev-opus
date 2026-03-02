import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("TypeScript configuration", () => {
  it("base tsconfig enables strict mode", () => {
    const config = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "..", "..", "tsconfig.base.json"),
        "utf-8"
      )
    );
    expect(config.compilerOptions.strict).toBe(true);
  });

  it("server tsconfig extends base and targets server output", () => {
    const config = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "tsconfig.json"),
        "utf-8"
      )
    );
    expect(config.extends).toContain("tsconfig.base.json");
    expect(config.compilerOptions.outDir).toContain("dist/server");
  });

  it("client tsconfig extends base and enables JSX", () => {
    const clientConfig = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "..", "client", "tsconfig.json"),
        "utf-8"
      )
    );
    expect(clientConfig.extends).toContain("tsconfig.base.json");
    expect(clientConfig.compilerOptions.jsx).toBe("react-jsx");
    expect(clientConfig.compilerOptions.lib).toContain("DOM");
  });

  it("client tsconfig does not emit (Vite handles bundling)", () => {
    const clientConfig = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "..", "client", "tsconfig.json"),
        "utf-8"
      )
    );
    expect(clientConfig.compilerOptions.noEmit).toBe(true);
  });
});
