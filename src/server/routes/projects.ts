import { Router } from "express";
import {
  listProjects,
  getProjectById,
  createProject,
} from "../services/projectsService.js";
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
    await ensureProjectContainer(project.id);
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

export default projectsRouter;
