import mongoose, { mongo } from "mongoose";

const postSchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    content: {type: String, required: true},
    image: {type: String, default: ""},
    upVotes: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    downVotes: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
},{timestamps: true});

const Post = mongoose.model("Post", postSchema);

export default Post;