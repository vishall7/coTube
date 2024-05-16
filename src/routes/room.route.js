import { Router } from "express"; 
import { isAuthorizedForRoom, isRoomActive, isYoutuber, verifyJWT } from "../middlewares/auth.middleware.js";
import { closeRoom, countRoomParticipants, createRoom, furtherAction, getCurrentRoom, inviteToRoom, joinRoom, pendingRoomRequests } from "../controllers/room.controller.js";

const router = Router();

router.route("/create-room").post(verifyJWT,isYoutuber,createRoom);

router.route("/invite-to-room/:receiverID").post(verifyJWT,isYoutuber,isRoomActive,inviteToRoom);

router.route("/close-room").get(verifyJWT,isYoutuber,isRoomActive,closeRoom)

//editors routes
router.route("/join-to-room/:requestId").post(verifyJWT,isRoomActive,joinRoom);

router.route("/joined").get(verifyJWT,isRoomActive,isAuthorizedForRoom,furtherAction)

router.route("/pending-requests").get(verifyJWT,pendingRoomRequests);

// both routes

router.route("/current-room").get(verifyJWT,isRoomActive,getCurrentRoom);

router.route("/participant-count").get(verifyJWT,isRoomActive,countRoomParticipants)

export default router