import dotenv from "dotenv";
import { connectDB } from "./db/connect.js";
import { app } from "./app.js"; 


dotenv.config({
    path: "./env"
});

const port = process.env.PORT || 3000

const start = async () => {
    try {
        await connectDB();
        app.on("error",(err)=>{
            console.log("Some error has occured: ",err)
        });
        app.listen(port,()=>{
            console.log(`server running on port ${port}`)
        })
    } catch (error) {
        console.error("something went wrong: ",error)
    }
};

start();
