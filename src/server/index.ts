import express from "express";
import healthRouter from "./routes/health.js";

const app = express();
const PORT = parseInt(process.env["PORT"] ?? "3000", 10);

app.use(express.json());
app.use(healthRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
