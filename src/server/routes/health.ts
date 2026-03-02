import { Router } from "express";
import { cosmosClient } from "../azure/cosmosClient.js";
import { blobServiceClient } from "../azure/blobClient.js";

const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  const checks: Record<string, string> = {};

  try {
    await cosmosClient.getDatabaseAccount();
    checks["cosmosDb"] = "connected";
  } catch {
    checks["cosmosDb"] = "unavailable";
  }

  try {
    await blobServiceClient.getProperties();
    checks["blobStorage"] = "connected";
  } catch {
    checks["blobStorage"] = "unavailable";
  }

  const allHealthy = Object.values(checks).every((v) => v === "connected");
  const status = allHealthy ? "ok" : "degraded";

  res.status(allHealthy ? 200 : 503).json({ status, checks });
});

export default healthRouter;
