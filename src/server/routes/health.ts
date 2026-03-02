import { Router } from "express";
import { cosmosClient } from "../azure/cosmosClient.js";
import { blobServiceClient } from "../azure/blobClient.js";

const healthRouter = Router();

const HEALTH_TIMEOUT_MS = 5000;

healthRouter.get("/health", async (_req, res) => {
  const [cosmosResult, blobResult] = await Promise.allSettled([
    cosmosClient.getDatabaseAccount({ abortSignal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) }),
    blobServiceClient.getProperties({ abortSignal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) }),
  ]);

  const checks = {
    cosmosDb: cosmosResult.status === "fulfilled" ? "connected" : "unavailable",
    blobStorage: blobResult.status === "fulfilled" ? "connected" : "unavailable",
  };

  const allHealthy = Object.values(checks).every((v) => v === "connected");
  const status = allHealthy ? "ok" : "degraded";

  res.status(allHealthy ? 200 : 503).json({ status, checks });
});

export default healthRouter;
