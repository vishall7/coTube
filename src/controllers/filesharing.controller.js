import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileUploadToCloudinary } from "../utils/cloudinary.js";
import axios from "axios";
import { SharedFile } from "../models/sharedFile.model.js";


// upload file to cloudinary and return download url

const uploadAndShareFile = asyncHandler(async (req,res)=>{

    const videoLocalPath = req.file?.path;
    
    if(!videoLocalPath){
        throw new ApiError(400,"file missing")
    }

    const uploadedVideo = await fileUploadToCloudinary(videoLocalPath);

    if(!uploadedVideo){
        throw new ApiError(400,"file not uploaded")
    }

    const sharedFile = await SharedFile.create(
        {
            videoFile: encodeURIComponent(uploadedVideo.url),
            sendBy: req.user?._id,            
        }
    )
    // send video as message to room using socketio     
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,sharedFile,"file uploaded and ready to share")
    )
    
})

const downloadFile = asyncHandler(async (req, res) => {
    // Suppose you are in room and you receive video that you want to download
    // Get its public URL from params
    const videoUrl = decodeURIComponent(req.params.videoUrl);

    const filenamePattern = /\/([^/]+)\.(jpg|jpeg|png|gif|mp4|mov|avi|...)$/i;

    // Set the file name
    const filename = videoUrl.match(filenamePattern);

    const response = await axios({
        method: 'GET',
        url: videoUrl,
        responseType: 'stream'
    })

    response.data.pipe(res)

    res.setHeader('Content-Disposition', `attachment; filename="${filename[0]}"`);

    return res
    .status(200)
    .json(
        new ApiResponse(200,`${filename[0]} video downloaded to your local pc`)
    )
     
    
    
});



export {
    uploadAndShareFile,
    downloadFile
}