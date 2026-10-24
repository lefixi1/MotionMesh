import { Response } from "express";
import CommentModel from "../models/CommentModel";

const CommentController = {
  async getPostComments(req: any, res: Response) {
    try {
      const postId = Number(req.params.id);

      const comments = await CommentModel.getPostComments(postId);

      res.send(comments);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async addPostComment(req: any, res: Response) {
    try {
      const postId = Number(req.params.id);
      const userId = req.session.user.user_id;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).send({ message: "Empty comment" });
      }

      await CommentModel.addPostComment(userId, postId, content.trim());

      res.send({ message: "Comment added" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async getProjectComments(req: any, res: Response) {
    try {
      const projectId = Number(req.params.id);

      const comments = await CommentModel.getProjectComments(projectId);

      res.send(comments);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async addProjectComment(req: any, res: Response) {
    try {
      const projectId = Number(req.params.id);
      const userId = req.session.user.user_id;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).send({ message: "Empty comment" });
      }

      await CommentModel.addProjectComment(userId, projectId, content.trim());

      res.send({ message: "Comment added" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async updateComment(req: any, res: any) {
    try {
      const commentId = Number(req.params.id);
      const userId = req.session.user.user_id;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).send({ message: "Empty comment" });
      }

      const affectedRows = await CommentModel.updateComment(
        commentId,
        userId,
        content.trim(),
      );

      if (affectedRows === 0) {
        return res.status(403).send({ message: "Not allowed" });
      }

      res.send({ message: "Comment updated" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async deleteComment(req: any, res: Response) {
    try {
      const commentId = Number(req.params.id);
      const userId = req.session.user.user_id;

      const affectedRows = await CommentModel.deleteComment(commentId, userId);

      if (affectedRows === 0) {
        return res.status(403).send({
          message: "Not allowed or comment not found",
        });
      }

      res.send({ message: "Comment deleted" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async adminDeleteComment(req: any, res: any) {
    try {
      const commentId = Number(req.params.id);

      const affectedRows = await CommentModel.adminDeleteComment(commentId);

      if (affectedRows === 0) {
        return res.status(404).send({ message: "Comment not found" });
      }

      res.send({ message: "Comment deleted by admin" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },
};

export default CommentController;
