import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Azure client URL configuration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("BlobServiceClient is constructed with correct storage URL from config", async () => {
    const MockBlobServiceClient = vi.fn();
    vi.doMock("@azure/storage-blob", () => ({
      BlobServiceClient: MockBlobServiceClient,
    }));
    vi.doMock("../azure/credential.js", () => ({
      credential: { type: "mock" },
    }));
    vi.doMock("../config.js", () => ({
      storageAccountName: "stautodevxyz",
    }));

    await import("../azure/blobClient.js");
    expect(MockBlobServiceClient).toHaveBeenCalledWith(
      "https://stautodevxyz.blob.core.windows.net",
      { type: "mock" },
    );
  });

  it("CosmosClient is constructed with correct endpoint and aadCredentials from config", async () => {
    const MockCosmosClient = vi.fn();
    vi.doMock("@azure/cosmos", () => ({
      CosmosClient: MockCosmosClient,
    }));
    vi.doMock("../azure/credential.js", () => ({
      credential: { type: "mock" },
    }));
    vi.doMock("../config.js", () => ({
      cosmosAccountName: "cosmos-autodev-xyz",
    }));

    await import("../azure/cosmosClient.js");
    expect(MockCosmosClient).toHaveBeenCalledWith({
      endpoint: "https://cosmos-autodev-xyz.documents.azure.com:443/",
      aadCredentials: { type: "mock" },
    });
  });
});
