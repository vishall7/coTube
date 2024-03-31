import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const generateTokens = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({validateBeforeSave: false}); 
    return {accessToken,refreshToken}
}

const registerUser = asyncHandler(async (req,res)=> {
    
    const {username,email,fullname,password,role} = req.body;

    if([username,email,fullname,password,role].some((feild)=> feild?.trim() === "")){
        throw new ApiError(400,"All feilds are manditory")
    }

    if(!role){
        throw new ApiError(400,"user must specify his role")
    }

    const isUserExisted = await User.findOne({
        $or: [{username},{email},{role}]
    });

    if(isUserExisted){
        throw new ApiError(400,"user already existed")
    }

    const user = await User.create(
        {
            username,            
            fullname,
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

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("AccessToken",accessToken,options)
    .cookie("RefreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,loggedInUser,"login Successfully")
    )
     
})

const isAuthorized = asyncHandler(async (req,res) => {
    res.status(200).send("user is authorized and is a youtuber")
})

export {
    registerUser,
    loginUser,
    isAuthorized
}