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
            type: Number,            
            enum: [5, 10, 20, 40],
            default: 5           
        }
    }
);

roomSchema.methods.generateToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            roomName: this.roomName,
            createdBy: this.createdBy,            
        },
        process.env.ROOM_TOKEN_SECRET,
        {
            expiresIn: this.timeLimit * 60
        }
    )
}

export const Room = mongoose.model("Room",roomSchema);