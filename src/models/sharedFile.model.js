import mongoose, {Schema} from "mongoose";

const sharedFileSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true
        },
        sendBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },           
        isDeleted: {
        type: Boolean,
        default: false
        }
    },
    {timestamps: true}
)

export const SharedFile = mongoose.model("SharedFile",sharedFileSchema);
