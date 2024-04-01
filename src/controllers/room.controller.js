import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Room } from "../models/room.model.js";


const generateToken = async (roomId) => {
    const room = await Room.findById(roomId);    
    const token = await room.generateToken();    
    return token
}

const createRoom = asyncHandler(async (req,res)=>{
    //get userid is weather youtuber or not, if youtuber then 
    //check if room already created using token
    //create a room generate token send to cookie,
    //store it in db
    //create a middleware that checks if room expires or not

    if(req.cookies?.RoomToken){                
        throw new ApiError(400,"you have already created a room")
    }

    const userId = req.user._id;

    const {roomname,time} = req.body;

    if(roomname.trim() === ""){
        throw new ApiError(400,"please enter room name")
    }    

    const room = await Room.create({
        roomName: roomname,
        createdBy: userId,
        timeLimit: time
    }); 

    if(!room){
        throw new ApiError(400,"room not created")
    }
    
    const roomToken = await generateToken(room._id);

    if(!roomToken){
        throw new ApiError(400,"problem occured during room creation") 
    }

    const options = {
        maxAge: (time || 5) * 60 * 1000,
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("RoomToken",roomToken,options)
    .json(
        new ApiResponse(200,room,"room created successfully")
    )
})

const inviteToRoom = asyncHandler(async (req,res)=>{
    return res.status(200).send("invitation send")
})

export {
    createRoom,
    inviteToRoom
}