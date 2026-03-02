import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "..", "..", "dist");
const distExists = fs.existsSync(distDir);

describe.skipIf(!distExists)("build output", () => {
  it("server build produces dist/server/index.js", () => {
    const serverOutput = path.join(distDir, "server", "index.js");
    expect(fs.existsSync(serverOutput)).toBe(true);
  });

  it("client build produces dist/client/index.html", () => {
    const clientOutput = path.join(distDir, "client", "index.html");
    expect(fs.existsSync(clientOutput)).toBe(true);
  });

  it("client build produces hashed JS and CSS assets", () => {
    const assetsDir = path.join(distDir, "client", "assets");
    expect(fs.existsSync(assetsDir)).toBe(true);
    const files = fs.readdirSync(assetsDir);
    expect(files.some((f) => f.endsWith(".js"))).toBe(true);
    expect(files.some((f) => f.endsWith(".css"))).toBe(true);
  });
});
