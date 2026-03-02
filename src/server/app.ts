import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import healthRouter from "./routes/health.js";
import sampleSpecsRouter from "./routes/sampleSpecs.js";
import projectsRouter from "./routes/projects.js";

const app = express();
const IS_DEV = process.env["NODE_ENV"] === "development";

app.use(express.json({ limit: "2mb" }));
app.use("/api", healthRouter);
app.use("/api", sampleSpecsRouter);
app.use("/api", projectsRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

if (!IS_DEV) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDistPath = path.join(__dirname, "..", "client");

  app.use(express.static(clientDistPath));

  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

export default app;
