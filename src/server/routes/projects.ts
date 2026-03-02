import { Router } from "express";
import { listProjects, getProjectById } from "../services/projectsService.js";

const projectsRouter = Router();

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
