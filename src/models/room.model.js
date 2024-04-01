import mongoose, {Schema}  from "mongoose";
import jwt from "jsonwebtoken";


const roomSchema = new Schema(
    {
        roomName: {
            type: String,
            lowercase: true,
            trim: true,
            required: true,
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",            
            required: true
        },
        timeLimit: {
            type: Date,
            default: Date.now() + (10 * 60000) 
        }
    }
);

roomSchema.methods.generateToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            roomName: this.roomName,
            createdBy: this.createdBy,            
        },
        process.env.ROOM_TOKEN_SECRET,
        {
            expiresIn: this.timeLimit
        }
    )
}

export const Room = mongoose.model("Room",roomSchema);