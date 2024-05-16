import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true,limit: "16kb"}))
app.use(cookieParser())
app.use(express.static("public"))
app.use((err,req,res,next)=>{
    if(res.headersSent){
        return next(err)
    }
    
    return res.status(err.statusCode).json({error: err.message})
})

// route import 

import userRouter from "./routes/user.route.js";
import roomRouter from "./routes/room.route.js";
import fileRouter from "./routes/filesharing.route.js";
// route declaration

app.use("/api/v1/user",userRouter);
app.use("/api/v1/room",roomRouter);
app.use("/api/v1/file",fileRouter);
export { app }