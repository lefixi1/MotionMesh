import { Request, Response } from "express";
import PostModel from "../models/PostModel";

const PostController = {
  async createPost(req: any, res: Response) {
    try {
      const userId = req.session.user.user_id;
      const { title, description, concept, result, visibility, project_id } =
        req.body;
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

      if (!title) {
        return res.status(400).send({ message: "Title is required" });
      }

      if (!req.file) {
        return res.status(400).send({ message: "File is required" });
      }

      const projectId = project_id ? Number(project_id) : null;

      const postId = await PostModel.createPost(
        userId,
        projectId,
        title,
        description,
        concept,
        result,
        visibility,
      );

      await PostModel.insertFile(
        postId,
        req.file.filename,
        req.file.path,
        req.file.mimetype,
      );

      await PostModel.insertTags(postId, tags);

      res.send({ message: "Post created", postId });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server error" });
    }
  },

  async getPostById(req: Request, res: Response) {
    try {
      const postId = Number(req.params.id);

      const post = await PostModel.getPostById(postId);

      if (!post) {
        return res.status(404).send({ message: "Post not found" });
      }

      res.send(post);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server error" });
    }
  },

  async getUserPosts(req: any, res: Response) {
    try {
      const userId = req.session.user.user_id;

      const posts = await PostModel.getUserPosts(userId);

      res.send(posts);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server error" });
    }
  },

  async getPublicPosts(req: Request, res: Response) {
    try {
      const posts = await PostModel.getPublicPosts();
      res.send(posts);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server error" });
    }
  },

  async getRandomPosts(req: Request, res: Response) {
    try {
      const posts = await PostModel.getRandomPosts();
      res.send(posts);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server error" });
    }
  },

  async searchPosts(req: Request, res: Response) {
    try {
      const q = String(req.query.q || "");
      const mode = (req.query.mode as "posts" | "users") || "posts";

      const posts = await PostModel.searchPosts(q, mode);

      res.send(posts);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server error" });
    }
  },

  async updatePost(req: any, res: Response) {
    try {
      const postId = Number(req.params.id);
      const userId = req.session.user.user_id;

      const {
        title,
        description,
        concept,
        result,
        visibility,
        tags,
        project_id,
      } = req.body;

      const projectId = project_id ? Number(project_id) : null;

      const affected = await PostModel.updatePost(
        postId,
        userId,
        projectId,
        title,
        description,
        concept,
        result,
        visibility,
      );

      if (affected === 0) {
        return res.status(404).send({ message: "Not found or not allowed" });
      }

      await PostModel.clearPostTags(postId);
      await PostModel.insertTags(postId, tags || []);

      res.send({ message: "Updated" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server error" });
    }
  },

  async deletePost(req: any, res: Response) {
    try {
      const postId = Number(req.params.id);
      const userId = req.session.user.user_id;

      const affected = await PostModel.deletePost(postId, userId);

      if (affected === 0) {
        return res.status(404).send({ message: "Not found or not allowed" });
      }

      res.send({ message: "Deleted" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server error" });
    }
  },

  async adminDeletePost(req: any, res: any) {
    try {
      const postId = Number(req.params.id);

      const affectedRows = await PostModel.adminDeletePost(postId);

      if (affectedRows === 0) {
        return res.status(404).send({ message: "Post not found" });
      }

      res.send({ message: "Post deleted by admin" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },
};

export default PostController;
