import { Router } from "express";
import { downloadFile, uploadFile } from "../controllers/filesharing.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload").post(
    upload.single("video"),
    uploadFile
)

router.route("/download/:videoUrl").get(downloadFile)

export default router



