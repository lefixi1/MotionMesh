import { Response } from "express";
import ProjectModel from "../models/ProjectModel";
import { ProjectStatus } from "../types/Types";

const ProjectController = {
  async createProject(req: any, res: Response) {
    try {
      const ownerUserId = req.session.user.user_id;

      const { title, overview, progress_percent, status, deadline } = req.body;

      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      const lookingFor = req.body.lookingFor
        ? JSON.parse(req.body.lookingFor)
        : [];
      const tasks = req.body.tasks ? JSON.parse(req.body.tasks) : [];
      const participants = req.body.participants
        ? JSON.parse(req.body.participants)
        : [];

      if (!title || !title.trim()) {
        return res.status(400).send({ message: "Project title is required" });
      }

      const projectId = await ProjectModel.createProject(
        ownerUserId,
        title.trim(),
        overview || "",
        Number(progress_percent) || 0,
        (status || "open") as ProjectStatus,
        deadline || null,
      );

      if (req.file) {
        await ProjectModel.insertFile(
          projectId,
          req.file.originalname,
          req.file.path,
          req.file.mimetype,
        );
      }

      await ProjectModel.insertTasks(projectId, tasks);
      await ProjectModel.insertTags(projectId, tags);
      await ProjectModel.insertSkills(projectId, lookingFor);
      await ProjectModel.insertParticipants(projectId, participants);

      res.send({
        message: "Project created successfully",
        project_id: projectId,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async getPublicProjects(req: any, res: Response) {
    try {
      const projects = await ProjectModel.getPublicProjects();
      res.send(projects);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async getUserProjects(req: any, res: Response) {
    try {
      const userId = req.session.user.user_id;
      const projects = await ProjectModel.getUserProjects(userId);
      res.send(projects);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async getProjectById(req: any, res: Response) {
    try {
      const projectId = Number(req.params.id);
      const project = await ProjectModel.getProjectById(projectId);

      if (!project) {
        return res.send(null);
      }

      res.send(project);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async getParticipationPosts(req: any, res: Response) {
    try {
      const projectId = Number(req.params.id);

      const posts = await ProjectModel.getParticipationPosts(projectId);

      res.send(posts);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async createJoinRequest(req: any, res: Response) {
    try {
      const projectId = Number(req.params.id);
      const userId = req.session.user.user_id;
      const username = req.session.user.username;
      const { message } = req.body;

      const project = await ProjectModel.getProjectById(projectId);

      if (!project) {
        return res.status(404).send({ message: "Project not found" });
      }

      if (project.owner.user_id === userId) {
        return res.status(400).send({
          message: "You cannot request to join your own project",
        });
      }

      const requestId = await ProjectModel.createJoinRequest(
        projectId,
        userId,
        message || "",
      );

      await ProjectModel.createJoinRequestNotification(
        project.owner.user_id,
        requestId,
      );

      res.send({
        message: "Join request sent successfully",
        requestId,
      });
    } catch (err: any) {
      console.log(err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).send({
          message: "You already sent a join request for this project",
        });
      }

      res.status(500).send({ message: "Database error" });
    }
  },

  async updateProject(req: any, res: Response) {
    try {
      const projectId = Number(req.params.id);
      const userId = req.session.user.user_id;

      const {
        title,
        overview,
        progress_percent,
        status,
        deadline,
        tags,
        lookingFor,
        tasks,
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).send({ message: "Project title is required" });
      }

      const affectedRows = await ProjectModel.updateProject(
        projectId,
        userId,
        title.trim(),
        overview || "",
        progress_percent ?? 0,
        (status || "open") as ProjectStatus,
        deadline || null,
      );

      if (affectedRows === 0) {
        return res.status(403).send({
          message: "You are not allowed to update this project",
        });
      }

      await ProjectModel.clearProjectData(projectId);

      await ProjectModel.insertTasks(projectId, tasks || []);
      await ProjectModel.insertTags(projectId, tags || []);
      await ProjectModel.insertSkills(projectId, lookingFor || []);

      res.send({ message: "Project updated successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async deleteProject(req: any, res: Response) {
    try {
      const projectId = Number(req.params.id);
      const userId = req.session.user.user_id;

      const affectedRows = await ProjectModel.deleteProject(projectId, userId);

      if (affectedRows === 0) {
        return res.status(403).send({
          message: "You are not allowed to delete this project",
        });
      }

      res.send({ message: "Project deleted successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async adminDeleteProject(req: any, res: any) {
    try {
      const projectId = Number(req.params.id);

      const affectedRows = await ProjectModel.adminDeleteProject(projectId);

      if (affectedRows === 0) {
        return res.status(404).send({ message: "Project not found" });
      }

      res.send({ message: "Project deleted by admin" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },
};

export default ProjectController;
