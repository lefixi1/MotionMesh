import express from "express";
import ProjectController from "../controllers/ProjectController";
import checkAuth from "../middleware/ChechAuth";
import checkAdmin from "../middleware/CheckAdmin";
import upload from "../middleware/Upload";

const router = express.Router();

router.post(
  "/projects",
  checkAuth,
  upload.single("file"),
  ProjectController.createProject,
);

router.get("/projects/public", checkAuth, ProjectController.getPublicProjects);
router.get("/projects/user", checkAuth, ProjectController.getUserProjects);

router.get(
  "/projects/:id/participation-posts",
  checkAuth,
  ProjectController.getParticipationPosts,
);

router.post(
  "/projects/:id/join-request",
  checkAuth,
  ProjectController.createJoinRequest,
);

router.get("/projects/:id", checkAuth, ProjectController.getProjectById);

router.put("/projects/:id", checkAuth, ProjectController.updateProject);
router.delete("/projects/:id", checkAuth, ProjectController.deleteProject);
router.delete(
  "/admin/projects/:id",
  checkAuth,
  checkAdmin,
  ProjectController.adminDeleteProject,
);

export default router;
