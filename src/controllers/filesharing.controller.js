import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileUploadToCloudinary, fileDeleteToCloudinary } from "../utils/cloudinary.js";
import axios from "axios";
import { SharedFile } from "../models/sharedFile.model.js";
import {FileReceiver} from "../models/fileReceiver.model.js";
import {RoomParticipant} from "../models/roomParticipant.model.js";

// upload file to cloudinary and return download url

const uploadAndShareFile = asyncHandler(async (req,res)=>{

    const videoLocalPath = req.file?.path;    

    // throw new Error 
    if(!videoLocalPath){
        throw new ApiError(400,"file missing")
    }

    const roomParticipants = await RoomParticipant.find({
        roomID: req.room?._id,
        roomOwnerID: req.user?._id 
    }).select('participantID'); 

    if(!roomParticipants.length){
        throw new ApiError(400,"room participants not found")
    }
    console.log(roomParticipants)
    const uploadedVideo = await fileUploadToCloudinary(videoLocalPath);

    if(!uploadedVideo){
        throw new ApiError(400,"file not uploaded")
    }

    const sharedFile = await SharedFile.create(
        {
            videoFile: uploadedVideo.url,
            sendBy: req.user?._id,            
        }
    )    

    const recipients = roomParticipants.map(participant => participant.participantID);
      
      // Create a new Receivers document
    const receivers = await FileReceiver.create({
        videoFile: sharedFile._id,
        sendBy: req.user._id,
        receivedBy: recipients,
        isDownloaded: recipients.map(() => false)
    });
    // send video as message to room using socketio    
     console.log(receivers)      
    return res
    .status(200)
    .json(
        new ApiResponse(200,sharedFile,"file uploaded and ready to share")
    )
    
})

const downloadFile = asyncHandler(async (req, res) => {
    // Suppose you are in room and you receive video that you want to download

    const sharedFileId = req.params?.sharedFileId;
    const recipientId = req.user?._id; 
   
    const receivers = await FileReceiver.findOne({
      videoFile: sharedFileId,
      receivedBy: recipientId
    });

    if (!receivers) {
      throw new ApiError(404, 'File not found or not shared with you');
    }
    
    const recipientIndex = receivers.receivedBy.indexOf(recipientId);

    if (receivers.isDownloaded[recipientIndex]) {
      throw new ApiError(400, 'File already downloaded');
    }
    
    const sharedFile = await SharedFile.findById(sharedFileId);

    const filenamePattern = /\/([^/]+)\.(jpg|jpeg|png|gif|mp4|mov|avi|...)$/i;

    // Set the file name
    const filename = sharedFile.videoFile.match(filenamePattern);

    const response = await axios({
        method: 'GET',
        url: sharedFile.videoFile,
        responseType: 'stream'
    })
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename[0]}"`);
    res.setHeader('Content-Type', 'video/mp4');
    response.data.pipe(res);

    receivers.isDownloaded[recipientIndex] = true;
    await receivers.save();
    
    const allDownloaded = receivers.isDownloaded.every(Boolean);
    
    if(allDownloaded){
        await fileDeleteToCloudinary(sharedFile.videoFile);
        sharedFile.isDeleted = true;
        await sharedFile.save();
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,'File downloaded successfully')
    )   
    
});



export {
    uploadAndShareFile,
    downloadFile
}