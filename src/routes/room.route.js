import { Router } from "express"; 
import { isAuthorizedForRoom, isRoomActive, isYoutuber, verifyJWT } from "../middlewares/auth.middleware.js";
import { createRoom, furtherAction, inviteToRoom, joinRoom } from "../controllers/room.controller.js";

const router = Router();

router.route("/create-room").post(verifyJWT,isYoutuber,createRoom);

router.route("/invite-to-room/:receiverID").post(verifyJWT,isYoutuber,isRoomActive,inviteToRoom);


//editors routes
router.route("/join-to-room").post(verifyJWT,isRoomActive,joinRoom);

router.route("/joined").get(verifyJWT,isRoomActive,isAuthorizedForRoom,furtherAction)

export default router