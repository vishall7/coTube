import { Router } from "express";
import { uploadFile } from "../controllers/filesharing.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload").post(
    upload.single("video"),
    uploadFile
)

export default router



