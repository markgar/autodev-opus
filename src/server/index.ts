import express from "express";

const app = express();
const PORT = parseInt(process.env["PORT"] ?? "3000", 10);

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
