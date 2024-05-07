import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Room } from "../models/room.model.js";
import { Request } from "../models/request.model.js";
import { RoomParticipant } from "../models/roomParticipant.model.js";



const roomGenerateToken = async (roomId) => {
    const room = await Room.findById(roomId);    
    const token = await room.generateToken();
    room.token = token;
    await room.save({validateBeforeSave: false})    
    return token
}

// youtubers controllers 

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
    
    const roomToken = await roomGenerateToken(room._id);

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
    //get receivers id,
    // check if the reqeust already made by checking status
    //create request send it to receiver and store it to database  
    const {receiverID} = req.params;

    const requestExisted = await Request.findOne({        
        senderID: req.user?._id,
        receiverID: receiverID,
        roomToken: req.room.token,
        pending: true
    });

    if(requestExisted){
        throw new ApiError(400,"request already send")
    }

    // need to send request using socketIo but will do that later 

    const request = await Request.create(
        {
            senderID: req.user._id,
            receiverID: receiverID,
            roomToken: req.room.token,
            pending: true  
        }
    );

    if(!request){
        throw new ApiError(400,"request not created")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,request,"Invitation send successfully")
    )
})

const closeRoom = asyncHandler(async (req,res)=>{
    //check if the room is closed or not
    //if closed throw error
    //if not closed close the room
    //if closed successfully send response
    if(!req.room){
        throw new ApiError(400,"room not found")
    }
    
    const deletedRoom = await Room.findByIdAndUpdate(
        req.room._id,
        {
            $unset: {
                token: ''
            }
        },
        {new: true}
    );

    if(!deletedRoom){
        throw new ApiError(400,'room token not deleted')
    }

    
    return res
    .status(200)
    .clearCookie('RoomToken')
    .json(
        new ApiResponse(200,deletedRoom,"room has been deleted")
    )
})

const countRoomParticipants = asyncHandler(async (req, res) => {
    const roomId = req.room?._id;

    const roomParticipants = await RoomParticipant.aggregate([
        {
            $match: { roomID: roomId }
        },
        {
            $group: {
                _id: "$roomID",
                count: { $sum: 1 },
                participants: { $push: "$participantID" }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "participants",
                foreignField: "_id",
                as: "participantsDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 0,                            
                            fullname: 1    
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                count: 1,
                participants: "$participantsDetails"
            }
        }
    ]);

    if (roomParticipants.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, { count: 0, participants: [] }, "No participants in the room")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, roomParticipants[0], "Room participants fetched successfully")
    );
});

 
// editors controllers

const joinRoom = asyncHandler(async(req,res)=>{
    //check if the request is being accepted or not
    //if request accepted change its status
    //create room Participent and by that create jwt
    // if successfully created further routes will have access to room and no other participent have access
    
    let request = await Request.findOne({        
        senderID: req.room?.createdBy,
        receiverID: req.user?._id,
        roomToken: req.room?.token,        
    })

    if(!request){
        throw new ApiError(400,"request is not being made")
    }

    const alreadyParticipant = await RoomParticipant.findOne({
        roomID: req.room._id,
        roomOwnerID: req.room?.createdBy,
        participantID: req.user?._id,
    })

    if(alreadyParticipant){
        throw new ApiError(400,"you`re already room participant")
    }

     // suppose request is accepted using socketIo

    let accepted = true;
    
    if(!accepted){
        throw new ApiError(400,"request declined")
    }

    request.pending = false;  // accept the request and change its status in db  
    await request.save({validateBeforeSave: true})
    
    

    const createRoomParticipant = await RoomParticipant.create({
        roomID: req.room?._id,
        roomOwnerID: req.room?.createdBy,
        participantID: req.user?._id,        
    })

    if(!createRoomParticipant){
        throw new ApiError(400,"can not able to join the room")
    }    

    
    const token = await createRoomParticipant.generateToken(req.room?.timeLimit);
    createRoomParticipant.token = token;
    await createRoomParticipant.save({validateBeforeSave: false}) 
    

    return res
    .status(200)    
    .json(
        new ApiResponse(200,createRoomParticipant,"you have joined the room")
    )
})

const furtherAction = asyncHandler(async (req,res)=>{
    return res.status(200).send("access to room")
})

export {
    createRoom,
    inviteToRoom,
    joinRoom,
    furtherAction,
    closeRoom,
    countRoomParticipants
}