import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "..", "..");

describe("shadcn/ui configuration", () => {
  it("components.json is valid JSON with required fields", () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(rootDir, "components.json"), "utf-8")
    );
    expect(config.tsx).toBe(true);
    expect(config.rsc).toBe(false);
    expect(config.aliases).toBeDefined();
  });

  it("components.json aliases point to correct project paths", () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(rootDir, "components.json"), "utf-8")
    );
    expect(config.aliases.utils).toBe("@/lib/utils");
    expect(config.aliases.ui).toBe("@/components/ui");
    expect(config.aliases.components).toBe("@/components");
  });

  it("components.json references client index.css for Tailwind", () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(rootDir, "components.json"), "utf-8")
    );
    expect(config.tailwind.css).toContain("src/client/index.css");
  });
});
