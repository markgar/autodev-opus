import { Router } from "express";
import {
  listSpecs,
  getSpecContent,
  uploadSpec,
  deleteSpec,
} from "../services/sampleSpecs.js";

const sampleSpecsRouter = Router();

sampleSpecsRouter.get("/sample-specs", async (_req, res) => {
  try {
    const specs = await listSpecs();
    res.json(specs);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message });
  }
});

sampleSpecsRouter.get("/sample-specs/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const content = await getSpecContent(name);
    res.setHeader("Content-Type", "text/markdown");
    res.status(200).send(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("BlobNotFound") ? 404 : 500;
    res.status(status).json({ message: status === 404 ? `Spec "${name}" not found` : message });
  }
});

sampleSpecsRouter.post("/sample-specs", async (req, res) => {
  const { name, content } = req.body as { name?: string; content?: string };

  if (!name || !name.endsWith(".md")) {
    res.status(400).json({ message: "name is required and must end with .md" });
    return;
  }

  if (!content || content.trim().length === 0) {
    res.status(400).json({ message: "content is required and must be non-empty" });
    return;
  }

  try {
    await uploadSpec(name, content);
    res.status(201).json({ name });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message });
  }
});

sampleSpecsRouter.delete("/sample-specs/:name", async (req, res) => {
  const { name } = req.params;

  try {
    await deleteSpec(name);
    res.status(204).end();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("BlobNotFound") ? 404 : 500;
    res.status(status).json({ message: status === 404 ? `Spec "${name}" not found` : message });
  }
});

export default sampleSpecsRouter;
