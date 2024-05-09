import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            required: true
        },        
        email: {
            type: String,
            unique: true,            
            trim: true,
            required: true
        },
        password: {
            type: String,            
            required: [true,"password must be provided"]
        },
        role: {
            type: String,            
            enum: ['youtuber', 'editor'],
            default: 'youtuber'
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save",async function(next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,            
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};

userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign(
        {
            _id: this._id,            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};

export const User = mongoose.model("User",userSchema)