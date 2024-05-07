import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileUploadToCloudinary } from "../utils/cloudinary.js";
import Path from 'path';
import Fs from 'fs';
import axios from "axios";




// upload file to cloudinary and return download url

const uploadFile = asyncHandler(async (req,res)=>{

    const videoLocalPath = req.file?.path;
    
    if(!videoLocalPath){
        throw new ApiError(400,"file missing")
    }

    const uploadedVideo = await fileUploadToCloudinary(videoLocalPath);

    if(!uploadedVideo){
        throw new ApiError(400,"file not uploaded")
    }

    // send video as message to room using socketio

    const encodedUrl = encodeURIComponent(uploadedVideo.url);  
    console.log(encodedUrl)
    return res
    .status(200)
    .json(
        new ApiResponse(200,encodedUrl,"file uploaded")
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
    uploadFile,
    downloadFile
}