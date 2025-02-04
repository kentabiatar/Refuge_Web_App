import mongoose, { mongo } from "mongoose";

const postSchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    content: {type: String, required: true},
    image: {type: String, default: ""},
    upVotes: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    downVotes: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    comments: [{
        content: {type: String, required: true},
        image: {type: String, default: ""},
        author: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        upVotes: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
        downVotes: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
        createdAt: {type: Date, default: Date.now}
    }]
},{timestamps: true});

const Post = mongoose.model("Post", postSchema);

export default Post;