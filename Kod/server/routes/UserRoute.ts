import express from "express";
import UserController from "../controllers/UserController";
import checkAuth from "../middleware/ChechAuth";
import checkAdmin from "../middleware/CheckAdmin";

const router = express.Router();

router.get("/user", checkAuth, UserController.getCurrentUser);

router.get("/user/edit", checkAuth, UserController.getEditUser);
router.put("/user/edit", checkAuth, UserController.updateUser);

router.get("/users/search", checkAuth, UserController.searchUsers);
router.get("/users/:userId", checkAuth, UserController.getUserById);

router.get("/admin/users", checkAuth, checkAdmin, UserController.adminGetUsers);
router.put(
  "/admin/users/:id",
  checkAuth,
  checkAdmin,
  UserController.adminUpdateUser,
);
router.delete(
  "/admin/users/:id",
  checkAuth,
  checkAdmin,
  UserController.adminDeleteUser,
);

export default router;
