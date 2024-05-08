import { Router } from "express";
import { downloadFile, uploadAndShareFile } from "../controllers/filesharing.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/upload").post(
    verifyJWT,
    upload.single("video"),
    uploadAndShareFile
)

router.route("/download/:videoUrl").get(downloadFile)

export default router



