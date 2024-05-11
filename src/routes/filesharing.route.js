import { Router } from "express";
import { downloadFile, uploadAndShareFile } from "../controllers/filesharing.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isAuthorizedForRoom, isRoomActive, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/upload").post(
    verifyJWT,
    isRoomActive,
    isAuthorizedForRoom,
    upload.single("video"),
    uploadAndShareFile
)

router.route("/download/:sharedFileId").get(verifyJWT,isRoomActive,isAuthorizedForRoom,downloadFile)

export default router



