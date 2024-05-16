import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Room } from "../models/room.model.js";
import { RoomParticipant } from "../models/roomParticipant.model.js";


const verifyJWT = asyncHandler(async (req,res,next) => {

    const accessToken = req.cookies?.AccessToken; 
    
    if (!accessToken) {
        throw new ApiError(400,"unathourized request")
    }
    
    try {
        const decodeedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodeedToken?._id).select("-password -refreshToken");;
        
        if(!user){
            throw new ApiError(400, "user not found")
        }
    
        req.user = user;    
        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Room token has expired");
        } else {
            throw error
        }
    }   

})

const isYoutuber = asyncHandler(async (req,res,next) => {
    if(req.user.role !== "youtuber"){
        throw new ApiError(400,"youre not youtuber")
    }

    next();
})

const isRoomActive = asyncHandler(async (req, res, next) => {

    const roomToken = req.cookies?.RoomToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!roomToken) {
        throw new ApiError(400, "Room token not found");
    }

    try {
        const decodedToken = jwt.verify(roomToken, process.env.ROOM_TOKEN_SECRET);

        const room = await Room.findById(decodedToken._id).select("-token"); 
        
        if(!room){
            throw new ApiError(400, "room not found") 
        }

        req.room = room;
        next();
    } catch (error) {        
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Room token has expired");
        } else {
            throw error
        }        
    }
});


const isAuthorizedForRoom = asyncHandler(async (req,res,next)=>{

    const participent = await RoomParticipant.findOne(
        {
            roomID: req.room._id,
            roomOwnerID: req.room.createdBy,
            participantID: req.user._id  
        }
    )

    if(participent){
        try {
                const decodeedToken = jwt.verify(participent.token,process.env.ROOM_PARTICIPANT_TOKEN_SECRET);          
        
                if(!participent._id.equals(decodeedToken._id)){
                    throw new ApiError(400,"user not authorized for this room") 
                }
                req.roomParticipant = participent;
                next()
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new ApiError(401, "participant token has expired");
            } else {
                throw error
            }
        }
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

