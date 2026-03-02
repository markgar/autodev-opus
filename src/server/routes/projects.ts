import { Router } from "express";
import { randomUUID } from "node:crypto";
import {
  listProjects,
  getProjectById,
  createProject,
} from "../services/projectsService.js";
import { getProjectLogs } from "../services/logsService.js";
import { ensureProjectContainer } from "../services/projectContainers.js";
import { isValidSpecName } from "../services/sampleSpecs.js";

const projectsRouter = Router();

projectsRouter.post("/projects", async (req, res) => {
  const { name, specName } = req.body ?? {};

  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (trimmedName.length === 0) {
    res.status(400).json({ message: "Project name is required" });
    return;
  }
  if (trimmedName.length > 100) {
    res.status(400).json({ message: "Name must be 100 characters or less" });
    return;
  }
  const trimmedSpec = typeof specName === "string" ? specName.trim() : "";
  if (trimmedSpec.length === 0) {
    res.status(400).json({ message: "specName is required" });
    return;
  }
  if (!isValidSpecName(trimmedSpec)) {
    res.status(400).json({ message: "Invalid spec name format" });
    return;
  }

  try {
    const projectId = randomUUID();
    await ensureProjectContainer(projectId);
    const project = await createProject(projectId, trimmedName, trimmedSpec);
    res.status(201).json(project);
  } catch (error) {
    console.error("POST /projects failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

projectsRouter.get("/projects", async (_req, res) => {
  try {
    const projects = await listProjects();
    res.json(projects);
  } catch (error) {
    console.error("GET /projects failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

projectsRouter.get("/projects/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const project = await getProjectById(id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error(`GET /projects/${id} failed:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

projectsRouter.get("/projects/:id/logs", async (req, res) => {
  const { id } = req.params;

  try {
    const project = await getProjectById(id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const lines = await getProjectLogs(id);
    res.json({ lines });
  } catch (error) {
    console.error(`GET /projects/${id}/logs failed:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default projectsRouter;
