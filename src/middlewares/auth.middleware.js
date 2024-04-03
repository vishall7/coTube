import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Room } from "../models/room.model.js";
import { RoomParticipant } from "../models/roomParticipant.model.js";
import { isValidObjectId } from "mongoose";

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
        throw new ApiError(400,"room has been expired")
    }

    const decodeedToken = jwt.verify(roomToken,process.env.ROOM_TOKEN_SECRET);

    const room = await Room.findById(decodeedToken?._id);

    if(!room){
        throw new ApiError(400,"Invalid room token")
    }

    req.room = room;
    next();
})

const isAuthorizedForRoom = asyncHandler(async (req,res,next)=>{
    const participentToken = req.cookies?.RoomParticipantToken || req.header("Authorization")?.replace("Bearer ","");

    if(!participentToken){
        throw new ApiError(400,"unathourized access to room")
    }

    const decodeedToken = jwt.verify(participentToken,process.env.ROOM_PARTICIPANT_TOKEN_SECRET);

    const roomParticipant = await RoomParticipant.findById(decodeedToken._id)
    
    if(!roomParticipant.participantID.equals(req.user?._id)){
        throw new ApiError(400,"youre not authorized for this room") 
    }

    req.roomParticipant = roomParticipant;
    next()
}) 

export {
    verifyJWT,
    isYoutuber,
    isRoomActive,
    isAuthorizedForRoom
}