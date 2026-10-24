// const multer = require("multer");
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/");
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

export default upload;
