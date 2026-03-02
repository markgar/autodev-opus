import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default healthRouter;
