import mongoose, {Schema} from "mongoose";

const fileReceiverSchema = new Schema(
    {
        videoFile: {
            type: mongoose.Types.ObjectId,
            ref: "SharedFile",
            required: true
        },
        sendBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        receivedBy: [{
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        }],           
        isDownloaded: [{
            type: Boolean,
            default: false
        }]
    },
    {timestamps: true}
)

export const FileReceiver = mongoose.model("FileReceiver",fileReceiverSchema);
