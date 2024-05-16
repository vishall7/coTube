import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";


const generateTokens = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({validateBeforeSave: false}); 
    return {accessToken,refreshToken}
}

const options = {
    httpOnly: true,
    secure: true
}


const registerUser = asyncHandler(async (req,res)=> {
    
    const {username,email,password,role,confirmPassword} = req.body;

    if([username,email,password,role,confirmPassword].some((feild)=> feild?.trim() === "")){
        throw new ApiError(400,"All feilds are manditory")
    }

    if(!role){
        throw new ApiError(400,"user must specify his role")
    }    

    const isUserExisted = await User.findOne({
        $or: [{username},{email}] 
    })   

    if(isUserExisted?.role === role){
        throw new ApiError(400,"user already existed")
    }

    if(confirmPassword !== password){
        throw new ApiError(400,"password and confirm password must be same")
    };

    const user = await User.create(
        {
            username,      
            email,
            password,
            role
        }
    )

    if(!user){
        throw new ApiError(400,"user not created")
    }

    const userCreated = await User.findById(user._id)
    .select("-password -refreshToken");
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,userCreated,"user created successfully")
    ) 
}); 


const loginUser = asyncHandler(async (req,res)=>{

    const {username,email,password} = req.body;

    if(!(username && email)){
        throw new ApiError(400,"username or email required");
    } 

    const userFound = await User.findOne({
        $and: [{username},{email}]
    })

    if(!userFound){
        throw new ApiError(409,"user not found");
    }

    if(!password){
        throw new ApiError(400,"please provide password")
    }

    const passwordCorrect = await userFound.isPasswordCorrect(password);
    
    if(!passwordCorrect){
        throw new ApiError(400,"password incorrect")
    }

    const {accessToken,refreshToken} = await generateTokens(userFound._id);

    const loggedInUser = await User.findById(userFound._id).select("-password -refreshToken");
         
    return res
    .status(200)
    .cookie("AccessToken",accessToken,options)    
    .cookie("RefreshToken",refreshToken,{...options,maxAge: 10 * 24 * 60 * 60 * 1000})
    .json(
        new ApiResponse(200,loggedInUser,"login Successfully")
    )
    
})

const getCurrentUser = asyncHandler(async(req,res)=>{

    const currentUser = req.user;
    
    if(!currentUser){
        throw new ApiError(400,"user not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,currentUser,"user fetch successfully")
    )
})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {new: true} 
    )

        
    return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json(
        new ApiResponse(200,{},"user logged out successfully")
    )
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.RefreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(400,"refresh token not found")
    }   

    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedRefreshToken._id);

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refreshtoken is expired or used");
        }

        const {accessToken,refreshToken} = await generateTokens(user._id);
        
        return res
        .status(200)
        .cookie("AccessToken",accessToken,options)
        .cookie("RefreshToken",refreshToken,{...options,maxAge: 10 * 24 * 60 * 60 * 1000})
        .json(
            new ApiResponse(200,{accessToken,refreshToken},"refresh token refreshed successfully")
        )

    } catch (error) {
        if(error.name === "JsonWebTokenError"){
            throw new ApiError(401,"refresh token has expired")
        } else {
            throw error
        }        
    }
})

const isAuthorized = asyncHandler(async (req,res) => {
    res.status(200).send("user is authorized and is a youtuber")
})

export {
    registerUser,
    loginUser,
    isAuthorized,
    getCurrentUser,
    logoutUser,
    refreshAccessToken
}