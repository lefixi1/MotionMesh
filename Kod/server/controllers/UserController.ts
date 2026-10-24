import { Response } from "express";
import UserModel from "../models/UserModel";

const UserController = {
  async getEditUser(req: any, res: Response) {
    try {
      const userId = req.session.user.user_id;
      const user = await UserModel.getUserEditData(userId);

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      const tags = await UserModel.getUserTags(userId);

      res.send({
        ...user,
        tags,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async updateUser(req: any, res: Response) {
    try {
      const userId = req.session.user.user_id;
      const { name, surname, username, description, tags } = req.body;

      const usernameExists = await UserModel.checkUsernameExists(
        username,
        userId,
      );

      if (usernameExists) {
        return res.send({ message: "Username already exists" });
      }

      const affectedRows = await UserModel.updateUser(
        userId,
        name,
        surname,
        username,
        description || "",
      );

      if (affectedRows === 0) {
        return res.status(404).send({ message: "User not found" });
      }

      await UserModel.clearUserTags(userId);
      await UserModel.insertTags(userId, tags || []);

      req.session.user.name = name;
      req.session.user.surname = surname;
      req.session.user.username = username;
      req.session.user.description = description || "";

      res.send({ message: "Profile updated successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async searchUsers(req: any, res: Response) {
    try {
      const q = String(req.query.q || "").trim();

      if (!q) {
        return res.send([]);
      }

      const users = await UserModel.searchUsers(q);
      res.send(users);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async getCurrentUser(req: any, res: Response) {
    try {
      const userId = req.session.user.user_id;

      const userData = await UserModel.getUserById(userId);

      if (!userData) {
        return res.status(404).send({ message: "User not found" });
      }

      res.send(userData);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async getUserById(req: any, res: Response) {
    try {
      const userId = Number(req.params.userId);

      const userData = await UserModel.getUserById(userId);

      if (!userData) {
        return res.status(404).send({ message: "User not found" });
      }

      const tags = await UserModel.getUserTags(userId);

      userData.user.tags = tags;

      res.send(userData);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async adminGetUsers(req: any, res: any) {
    try {
      const users = await UserModel.getAllUsers();
      res.send(users);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async adminUpdateUser(req: any, res: any) {
    try {
      const userId = Number(req.params.id);
      const { name, surname, username, description, role } = req.body;

      const affectedRows = await UserModel.adminUpdateUser(
        userId,
        name,
        surname,
        username,
        description || "",
        role || "user",
      );

      if (affectedRows === 0) {
        return res.status(404).send({ message: "User not found" });
      }

      res.send({ message: "User updated" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async adminDeleteUser(req: any, res: any) {
    try {
      const userId = Number(req.params.id);

      if (userId === req.session.user.user_id) {
        return res.status(400).send({
          message: "Admin cannot delete own account",
        });
      }

      const affectedRows = await UserModel.adminDeleteUser(userId);

      if (affectedRows === 0) {
        return res.status(404).send({ message: "User not found" });
      }

      res.send({ message: "User deleted" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },
};

export default UserController;
