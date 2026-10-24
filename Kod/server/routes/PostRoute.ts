import express from "express";
import PostController from "../controllers/PostController";
import checkAuth from "../middleware/ChechAuth";
import checkAdmin from "../middleware/CheckAdmin";
import upload from "../middleware/Upload";

const router = express.Router();

router.post(
  "/upload",
  checkAuth,
  upload.single("file"),
  PostController.createPost,
);

router.get("/user", checkAuth, PostController.getUserPosts);

router.get("/posts/public", checkAuth, PostController.getPublicPosts);
router.get("/posts/random", checkAuth, PostController.getRandomPosts);
router.get("/posts/search", checkAuth, PostController.searchPosts);

router.get("/posts/:id", checkAuth, PostController.getPostById);
router.put("/posts/:id", checkAuth, PostController.updatePost);
router.delete("/posts/:id", checkAuth, PostController.deletePost);
router.delete(
  "/admin/posts/:id",
  checkAuth,
  checkAdmin,
  PostController.adminDeletePost,
);

export default router;
