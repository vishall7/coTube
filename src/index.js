import dotenv from "dotenv";
import { app } from "./app.js"; 

dotenv.config({
    path: "./env"
});

const port = process.env.PORT || 3000

const start = async () => {
    try {

        app.on("error",(err)=>{
            console.log("ERROR: ",err)
        });
        app.listen(port,()=>{
            console.log(`server running on port ${port}`)
        });        
    } catch (error) {
        console.error("something went wrong",error)
    }
}

start()
