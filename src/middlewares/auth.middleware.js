import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export {
    verifyJWT,
    isYoutuber
}