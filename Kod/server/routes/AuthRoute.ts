import express from "express";
import {
  authCode,
  googleRegister,
  googleLogin,
  getLogin,
  logout,
} from "../controllers/AuthController";

const router = express.Router();

router.post("/auth", authCode);

router.post("/google-register", googleRegister);
router.post("/google-login", googleLogin);
router.get("/login", getLogin);

router.post("/logout", logout);

export default router;
