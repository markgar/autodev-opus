import { Router } from "express";
import {
  listSpecs,
  getSpecContent,
  uploadSpec,
  deleteSpec,
  SpecNotFoundError,
  isValidSpecName,
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

  if (!isValidSpecName(name)) {
    res.status(400).json({ message: "Invalid spec name" });
    return;
  }

  try {
    const content = await getSpecContent(name);
    res.setHeader("Content-Type", "text/markdown");
    res.status(200).send(content);
  } catch (error) {
    if (error instanceof SpecNotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message });
  }
});

sampleSpecsRouter.post("/sample-specs", async (req, res) => {
  const { name, content } = req.body as { name?: string; content?: string };

  if (!name || !isValidSpecName(name)) {
    res.status(400).json({ message: "Invalid name: must be a simple .md filename (alphanumeric, hyphens, underscores, dots)" });
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

  if (!isValidSpecName(name)) {
    res.status(400).json({ message: "Invalid spec name" });
    return;
  }

  try {
    await deleteSpec(name);
    res.status(204).end();
  } catch (error) {
    if (error instanceof SpecNotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message });
  }
});

export default sampleSpecsRouter;
