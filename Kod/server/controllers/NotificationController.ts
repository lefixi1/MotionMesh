import { Response } from "express";
import NotificationModel from "../models/NotificationModel";

const NotificationController = {
  async getNotifications(req: any, res: Response) {
    try {
      const userId = req.session.user.user_id;

      const notifications = await NotificationModel.getNotifications(userId);

      res.send(notifications);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async acceptJoinRequest(req: any, res: Response) {
    try {
      const requestId = Number(req.params.requestId);
      const currentUserId = req.session.user.user_id;

      const request = await NotificationModel.getJoinRequest(requestId);

      if (!request) {
        return res.status(404).send({ message: "Request not found" });
      }

      if (request.owner_user_id !== currentUserId) {
        return res.status(403).send({ message: "Not allowed" });
      }

      if (request.status !== "pending") {
        return res.status(400).send({
          message:
            request.status === "accepted"
              ? "Request already accepted"
              : "Request already declined",
        });
      }

      await NotificationModel.acceptJoinRequest(requestId);

      await NotificationModel.addParticipant(
        request.project_id,
        request.user_id,
      );

      await NotificationModel.updateOwnerNotification(
        requestId,
        currentUserId,
        "accepted",
      );

      await NotificationModel.createUserNotification(
        request.user_id,
        "request_accepted",
        requestId,
      );

      res.send({ message: "Request accepted" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async declineJoinRequest(req: any, res: Response) {
    try {
      const requestId = Number(req.params.requestId);
      const currentUserId = req.session.user.user_id;

      const request = await NotificationModel.getJoinRequest(requestId);

      if (!request) {
        return res.status(404).send({ message: "Request not found" });
      }

      if (request.owner_user_id !== currentUserId) {
        return res.status(403).send({ message: "Not allowed" });
      }

      if (request.status !== "pending") {
        return res.status(400).send({
          message:
            request.status === "accepted"
              ? "Request already accepted"
              : "Request already declined",
        });
      }

      await NotificationModel.declineJoinRequest(requestId);

      await NotificationModel.updateOwnerNotification(
        requestId,
        currentUserId,
        "declined",
      );

      await NotificationModel.createUserNotification(
        request.user_id,
        "request_declined",
        requestId,
      );

      res.send({ message: "Request declined" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },

  async markSeen(req: any, res: Response) {
    try {
      const userId = req.session.user.user_id;

      await NotificationModel.markSeen(userId);

      res.send({ message: "Notifications marked as seen" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Database error" });
    }
  },
};

export default NotificationController;
