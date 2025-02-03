import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    username: {type: String, required: true},
    email: {type: String, required: true}, 
    password: {type: String, required: true},
    profileImage: {type: String, default: ""},
    bio: {type: String, default: ""},
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]

},{timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;