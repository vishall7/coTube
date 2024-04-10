import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Room } from "../models/room.model.js";
import { RoomParticipant } from "../models/roomParticipant.model.js";


const verifyJWT = asyncHandler(async (req,res,next) => {

    const accessToken = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ","");
    
    if (!accessToken) {
        throw new ApiError(400,"unathourized request")
    }

    const decodeedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodeedToken._id);

    if(!user){
        throw new ApiError(400,"invalid accessToken")
    }

    req.user = user;

    next()   

})

const isYoutuber = asyncHandler(async (req,res,next) => {
    if(req.user.role !== "youtuber"){
        throw new ApiError(400,"youre not youtuber")
    }

    next();
})

const isRoomActive = asyncHandler(async (req,res,next)=>{

    const roomToken =  req.cookies?.RoomToken || req.header("Authorization")?.replace("Bearer ","");

    if(!roomToken){
        throw new ApiError(400,"room not found")
    }

    const decodeedToken = jwt.verify(roomToken,process.env.ROOM_TOKEN_SECRET);

    if(!decodeedToken){
        throw new ApiError(400,"room has been expired")
    }

    const room = await Room.findById(decodeedToken?._id);

    if(!room){
        throw new ApiError(400,"Invalid room token")
    }

    req.room = room;
    next();
})

const isAuthorizedForRoom = asyncHandler(async (req,res,next)=>{

    const participent = await RoomParticipant.findOne(
        {
            roomID: req.room._id,
            roomOwnerID: req.room.createdBy,
            participantID: req.user._id  
        }
    )

    if(participent){
    const decodeedToken = jwt.verify(participent.token,process.env.ROOM_PARTICIPANT_TOKEN_SECRET);
      
    if(!decodeedToken){
        throw new ApiError(400,"room access closed")
    }

    if(!participent._id.equals(decodeedToken._id)){
        throw new ApiError(400,"youre not authorized for this room") 
    }
    req.roomParticipant = participent;
    next()
    }

    if(!req.user._id.equals(req.room.createdBy)){
        throw new ApiError(400,"Unauthorized access to room")
    }

    req.roomParticipant = req.user._id;
    next() 
    
}) 

export {
    verifyJWT,
    isYoutuber,
    isRoomActive,
    isAuthorizedForRoom
}