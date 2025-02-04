import cloudinary from "../lib/cloudinary.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

export const getFeedPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: { $in: req.user.connections} })
        .populate("author", "name username profileImage")
        .populate("comments.author", "name username profileImage")
        .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error("error in get feed posts controller: ", error.msg);
        res.status(500).json({ msg: "Internal server error" });
    }
}

export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        .populate("author", "name username profileImage")
        .populate("comments.author", "name username profileImage");

        if(!post){
            return res.status(404).json({msg: "Post not found"});
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("error in get post by id controller: ", error.msg);
        res.status(500).json({ msg: "Internal server error" });
    }
}

export const createComment = async (req, res) => {
    try {
        const { content, image } = req.body;

        // Prepare comment object
        const commentData = { author: req.user._id, content };

        // Upload image if provided
        if (image) {
            const imageResult = await cloudinary.uploader.upload(image);
            commentData.image = imageResult.secure_url;
        }

        // Update post with new comment
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: commentData } },
            { new: true }
        ).populate("author", "name username profileImage");

        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // Create notification if the commenter is not the post owner
        if (post.author.toString() !== req.user._id.toString()) {
            await new Notification({
                receiver: post.author,
                type: "comment",
                sender: req.user._id,
                relatedPost: req.params.id
            }).save();
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("Error in create comment controller:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

export const createPost = async (req, res) => {
    try {
        const {content, image} = req.body;

        if(image){
            const imageResult = await cloudinary.uploader.upload(image);
            newPost = new Post({
                author: req.user._id,
                content,
                image: imageResult.secure_url
            });
        }else{
            newPost = new Post({
                author: req.user._id,
                content
            });
        }

        await newPost.save();
        res.status(201).json(newPost);

    } catch (error) {

        console.error("error in create post controller: ", error.msg);
        res.status(500).json({ msg: "Internal server error" });
        
    }
}

export const deletePost = async (req, res) => {
    try {

        post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg: "Post not found"});
        }

        if(post.author.toString() !== req.user._id.toString()){
            return res.status(403).json({msg: "Not authorized"});
        }

        if(post.image){
            await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({msg: "Post deleted successfully"});   
    } catch (error) {

        console.error("error in delete post controller: ", error.msg);
        res.status(500).json({ msg: "Internal server error" });
        
    }
}