import { describe, it, expect, vi, afterEach } from "vitest";

describe("stamp configuration (config.ts)", () => {
  const originalEnv = process.env["STAMP_ID"];

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env["STAMP_ID"] = originalEnv;
    } else {
      delete process.env["STAMP_ID"];
    }
    vi.resetModules();
  });

  it("defaults stampId to qqq when STAMP_ID is not set", async () => {
    delete process.env["STAMP_ID"];
    const config = await import("../config.js");
    expect(config.stampId).toBe("qqq");
  });

  it("derives storageAccountName as stautodev{stampId}", async () => {
    delete process.env["STAMP_ID"];
    const config = await import("../config.js");
    expect(config.storageAccountName).toBe("stautodevqqq");
  });

  it("derives cosmosAccountName as cosmos-autodev-{stampId}", async () => {
    delete process.env["STAMP_ID"];
    const config = await import("../config.js");
    expect(config.cosmosAccountName).toBe("cosmos-autodev-qqq");
  });

  it("uses custom STAMP_ID from environment", async () => {
    process.env["STAMP_ID"] = "abc123";
    const config = await import("../config.js");
    expect(config.stampId).toBe("abc123");
    expect(config.storageAccountName).toBe("stautodevabc123");
    expect(config.cosmosAccountName).toBe("cosmos-autodev-abc123");
  });

  it("throws on invalid STAMP_ID with uppercase letters", async () => {
    process.env["STAMP_ID"] = "ABC";
    await expect(import("../config.js")).rejects.toThrow("Invalid STAMP_ID");
  });

  it("throws on invalid STAMP_ID with special characters", async () => {
    process.env["STAMP_ID"] = "a/b c";
    await expect(import("../config.js")).rejects.toThrow("Invalid STAMP_ID");
  });

  it("throws on STAMP_ID exceeding 16 characters", async () => {
    process.env["STAMP_ID"] = "a".repeat(17);
    await expect(import("../config.js")).rejects.toThrow("Invalid STAMP_ID");
  });
});
