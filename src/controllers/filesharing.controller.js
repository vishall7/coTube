import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileUploadTOCloudinary } from "../utils/cloudinary.js";

const uploadFile = asyncHandler(async (req,res)=>{
    const videoLocalPath = req.file?.path;
    console.log(videoLocalPath)
    if(!videoLocalPath){
        throw new ApiError(400,"file missing")
    }

    const uploadedvideo = await fileUploadTOCloudinary(videoLocalPath);

    if(!uploadedvideo){
        throw new ApiError(400,"file not uploaded")
    }   

    const cloudinaryUrl = uploadedvideo.url; 

// Add transformation parameters to trigger download
    const downloadUrl = cloudinaryUrl + '#.mp4';

// Provide the direct download link to users
    console.log(downloadUrl); 

    
    return res
    .status(200)
    .json(
        new ApiResponse(200,downloadUrl,"video uploaded")
    )
})

const downloadFile = asyncHandler(async (req,res)=> {
    //get download
})


export {
    uploadFile
}