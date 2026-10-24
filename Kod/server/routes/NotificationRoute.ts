import express from "express";
import NotificationController from "../controllers/NotificationController";
import checkAuth from "../middleware/ChechAuth";

const router = express.Router();

router.get(
  "/notifications",
  checkAuth,
  NotificationController.getNotifications,
);

router.post(
  "/join-requests/:requestId/accept",
  checkAuth,
  NotificationController.acceptJoinRequest,
);

router.post(
  "/join-requests/:requestId/decline",
  checkAuth,
  NotificationController.declineJoinRequest,
);

router.put(
  "/notifications/mark-seen",
  checkAuth,
  NotificationController.markSeen,
);

export default router;
