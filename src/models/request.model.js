import mongoose, {Schema} from "mongoose";

const requestSchema = new Schema(
    {
        roomID: {
            type: mongoose.Types.ObjectId,
            ref: "Room",
            required: true
        },
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