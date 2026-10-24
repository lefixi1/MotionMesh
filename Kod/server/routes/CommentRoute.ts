import express from "express";
import CommentController from "../controllers/CommentController";
import checkAuth from "../middleware/ChechAuth";
import checkAdmin from "../middleware/CheckAdmin";

const router = express.Router();

router.get("/posts/:id/comments", checkAuth, CommentController.getPostComments);
router.post("/posts/:id/comments", checkAuth, CommentController.addPostComment);

router.get(
  "/projects/:id/comments",
  checkAuth,
  CommentController.getProjectComments,
);
router.post(
  "/projects/:id/comments",
  checkAuth,
  CommentController.addProjectComment,
);

router.put("/comments/:id", checkAuth, CommentController.updateComment);
router.delete("/comments/:id", checkAuth, CommentController.deleteComment);
router.delete(
  "/admin/comments/:id",
  checkAuth,
  checkAdmin,
  CommentController.adminDeleteComment,
);

export default router;
