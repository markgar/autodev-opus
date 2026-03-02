import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  createIfNotExists: vi.fn(),
}));

vi.mock("../azure/blobClient.js", () => ({
  blobServiceClient: {
    getContainerClient: () => ({
      createIfNotExists: mocks.createIfNotExists,
    }),
  },
}));

import { initBlobContainers } from "../azure/initBlob.js";

describe("initBlobContainers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createIfNotExists.mockResolvedValue({});
  });

  it("creates the sample-specs blob container", async () => {
    await initBlobContainers();
    expect(mocks.createIfNotExists).toHaveBeenCalledOnce();
  });

  it("propagates errors when container creation fails", async () => {
    mocks.createIfNotExists.mockRejectedValue(new Error("blob storage unreachable"));
    await expect(initBlobContainers()).rejects.toThrow("blob storage unreachable");
  });
});
