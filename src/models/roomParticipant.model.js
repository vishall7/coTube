import jwt from "jsonwebtoken";
import mongoose, {Schema} from "mongoose";

const roomParticipantSchema = new Schema(
    {
        roomID: {
            type: mongoose.Types.ObjectId,
            ref: "Room",
            required: true
        },
        roomOwnerID: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true 
        },
        participantID: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        token: {
            type: String
        }  
    },
    {
        timestamps: true
    }
);

roomParticipantSchema.methods.generateToken = function(time){
    return jwt.sign(
        {
            _id: this._id,
            roomID: this.roomID,
            roomOwnerID: this.roomOwnerID,
            participantID: this.participantID
        },
        process.env.ROOM_PARTICIPANT_TOKEN_SECRET,
        {
            expiresIn: (time * 60)            
        }
    ) 
} 

export const RoomParticipant = mongoose.model("RoomParticipant",roomParticipantSchema);