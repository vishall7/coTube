import mongoose, {Schema} from "mongoose";

const requestSchema = new Schema(
    {        
        senderID: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverID: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        roomToken: {
            type: String,
            required: true
        },
        pending: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const Request = mongoose.model("Request",requestSchema); 