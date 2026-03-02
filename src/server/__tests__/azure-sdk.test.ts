import { describe, it, expect } from "vitest";

describe("Azure SDK packages", () => {
  it("@azure/storage-blob is importable", async () => {
    const blob = await import("@azure/storage-blob");
    expect(blob.BlobServiceClient).toBeDefined();
  });

  it("@azure/cosmos is importable", async () => {
    const cosmos = await import("@azure/cosmos");
    expect(cosmos.CosmosClient).toBeDefined();
  });

  it("@azure/identity is importable", async () => {
    const identity = await import("@azure/identity");
    expect(identity.DefaultAzureCredential).toBeDefined();
  });
});
