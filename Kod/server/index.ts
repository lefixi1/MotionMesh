import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";

import authRoutes from "./routes/AuthRoute";
import postRoutes from "./routes/PostRoute";
import userRoutes from "./routes/UserRoute";
import projectRoutes from "./routes/ProjectRoute";
import notificationRoutes from "./routes/NotificationRoute";
import commentRoutes from "./routes/CommentRoute";
import NotificationModel from "./models/NotificationModel";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    name: "userId",
    secret: "soSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", authRoutes);
app.use("/", postRoutes);
app.use("/", userRoutes);
app.use("/", projectRoutes);
app.use("/", notificationRoutes);
app.use("/", commentRoutes);

setInterval(
  async () => {
    try {
      await NotificationModel.deleteOldNotifications();
    } catch (err) {
      console.log(err);
    }
  },
  60 * 60 * 1000,
);

app.listen(3001, () => {
  console.log("running server");
});
