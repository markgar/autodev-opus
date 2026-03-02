import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import healthRouter from "./routes/health.js";

const app = express();
const PORT = parseInt(process.env["PORT"] ?? "3000", 10);
const IS_DEV = process.env["NODE_ENV"] === "development";

app.use(express.json());
app.use(healthRouter);

if (!IS_DEV) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDir = path.join(__dirname, "..", "client");

  app.use(express.static(clientDir));

  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
