import { Router } from "express"; 
import { isRoomActive, isYoutuber, verifyJWT } from "../middlewares/auth.middleware.js";
import { createRoom, inviteToRoom } from "../controllers/room.controller.js";

const router = Router();

router.route("/create-room").post(verifyJWT,isYoutuber,createRoom);

router.route("/").get(verifyJWT,isYoutuber,isRoomActive,inviteToRoom)

export default router