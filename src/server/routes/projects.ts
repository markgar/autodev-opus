import { Router } from "express";
import { RestError } from "@azure/storage-blob";
import {
  listProjects,
  getProjectById,
  createProject,
} from "../services/projectsService.js";
import { getProjectLogs } from "../services/logsService.js";
import { ensureProjectContainer } from "../services/projectContainers.js";

const projectsRouter = Router();

projectsRouter.post("/projects", async (req, res) => {
  const { name, specName } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ message: "Project name is required" });
    return;
  }
  if (name.length > 100) {
    res.status(400).json({ message: "Name must be 100 characters or less" });
    return;
  }
  if (typeof specName !== "string" || specName.trim().length === 0) {
    res.status(400).json({ message: "specName is required" });
    return;
  }

  try {
    const project = await createProject(name.trim(), specName);
    try {
      await ensureProjectContainer(project.id);
    } catch (error) {
      console.warn("Failed to create blob container for project:", (error as Error).message);
    }
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
    if (error instanceof RestError && error.statusCode === 404) {
      res.json({ lines: [] });
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error(`GET /projects/${id}/logs failed:`, error);
    res.status(500).json({ message });
  }
});

export default projectsRouter;
