import db from "../config/DB";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(
  "320586673006-3bosb9mr30smg22f3bprpsu8o8b5no16.apps.googleusercontent.com",
);

const generateUsername = (name: string) => {
  const cleanName = name.replace(/\s+/g, "").toLowerCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomNum}`;
};

export const authCode = async (req: any, res: any) => {
  const code = req.body.code;

  try {
    const [result]: any = await db.query("SELECT * FROM codes WHERE code = ?", [
      code,
    ]);

    if (result.length > 0) {
      res.send({
        authStat: true,
        message: "Code accepted",
      });
    } else {
      res.send({ authStat: false, message: "Invalid authorization code" });
    }
  } catch (err: any) {
    console.log(err);
    res.status(500).send({ authStat: false, message: "Database error" });
  }
};

export const googleRegister = async (req: any, res: any) => {
  const { name, familyName, email, googleId } = req.body;
  if (!email || !googleId) {
    return res.status(400).send({
      status: "register_failed",
      message: "Missing required Google data",
    });
  }

  const username = generateUsername(`${name || ""}${familyName || ""}`);

  try {
    const [insertResult]: any = await db.query(
      "INSERT INTO users (name, surname, email, username,  google_id) VALUES (?, ?, ?, ?, ?)",
      [name || "", familyName || "", email, username, googleId],
    );

    const [newUser]: any = await db.query(
      "SELECT * FROM users WHERE user_id = ?",
      [insertResult.insertId],
    );

    const user = newUser[0];

    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
    };
    res.send({
      status: "register_success",
      user: newUser[0],
    });
  } catch (err: any) {
    console.log("DB ERROR:", err);
    res.status(500).send({ message: "Database error" });
  }
};

export const getLogin = (req: any, res: any) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
};

export const googleLogin = async (req: any, res: any) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      console.log("No credential received");
      return res.status(400).send({ message: "Missing credential" });
    }
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience:
        "320586673006-3bosb9mr30smg22f3bprpsu8o8b5no16.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).send({ message: "Invalid Google payload" });
    }
    const { email, name, given_name, family_name, sub } = payload;
    const googleId = sub;

    const [result]: any = await db.query(
      "SELECT * FROM users WHERE google_id = ? OR email = ?",
      [googleId, email],
    );

    if (result.length > 0) {
      const user = result[0];
      req.session.user = {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
      };
      return res.send({
        status: "login_success",
        user: req.session.user,
      });
    }

    return res.send({
      status: "user_not_registered",
      googleData: {
        email,
        name: given_name || name || "",
        familyName: family_name || "",
        googleId,
      },
    });
  } catch (error: any) {
    console.log("GOOGLE VERIFY ERROR:", error);
    res.status(401).send({ message: "Invalid Google token" });
  }
};

export const logout = (req: any, res: any) => {
  req.session.destroy((err: any) => {
    if (err) {
      return res.send({ message: "Logout failed" });
    }
    res.clearCookie("userId");
    res.send({ message: "Logged out successfully" });
  });
};
