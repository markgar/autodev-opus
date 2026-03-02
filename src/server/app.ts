import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import healthRouter from "./routes/health.js";

const app = express();
const IS_DEV = process.env["NODE_ENV"] === "development";

app.use(express.json());
app.use("/api", healthRouter);

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
