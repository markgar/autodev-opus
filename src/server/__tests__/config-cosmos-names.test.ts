import { describe, it, expect, vi, afterEach } from "vitest";

describe("Cosmos DB config names", () => {
  const originalEnv = process.env["STAMP_ID"];

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env["STAMP_ID"] = originalEnv;
    } else {
      delete process.env["STAMP_ID"];
    }
    vi.resetModules();
  });

  it("exports cosmosDatabaseName as 'autodev'", async () => {
    delete process.env["STAMP_ID"];
    const config = await import("../config.js");
    expect(config.cosmosDatabaseName).toBe("autodev");
  });

  it("exports cosmosContainerName as 'items'", async () => {
    delete process.env["STAMP_ID"];
    const config = await import("../config.js");
    expect(config.cosmosContainerName).toBe("items");
  });

  it("cosmos names are independent of STAMP_ID value", async () => {
    process.env["STAMP_ID"] = "xyz789";
    const config = await import("../config.js");
    expect(config.cosmosDatabaseName).toBe("autodev");
    expect(config.cosmosContainerName).toBe("items");
  });
});
