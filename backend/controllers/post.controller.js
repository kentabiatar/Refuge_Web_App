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

const toggleVote = async (req, res, type) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        const isUpvoted = post.upVotes.includes(userId);
        const isDownvoted = post.downVotes.includes(userId);

        // toggle upvote and able to stay neutral
        if (type === "upvote") {
            if (!isUpvoted && isDownvoted) {
                post.downVotes = post.downVotes.filter(id => id.toString() !== userId.toString());
                post.upVotes.push(userId);
            } else if (!isUpvoted) {
                post.upVotes.push(userId);
            } else {
                post.upVotes = post.upVotes.filter(id => id.toString() !== userId.toString());
            }
        
        // toggle downvote and able to stay neutral
        } else if (type === "downvote") {
            if (!isDownvoted && isUpvoted) {
                post.upVotes = post.upVotes.filter(id => id.toString() !== userId.toString());
                post.downVotes.push(userId);
            } else if (!isDownvoted) {
                post.downVotes.push(userId);
            } else {
                post.downVotes = post.downVotes.filter(id => id.toString() !== userId.toString());
            }
        }

        await post.save();

        // Create notification if the user is not the post owner (no notif if user is neutral)
        if ((type === "upvote" && !isUpvoted) || (type === "downvote" && !isDownvoted)) {
            if (post.author.toString() !== userId.toString()) {
                const newNotification = new Notification({
                    receiver: post.author,
                    type,
                    sender: userId,
                    relatedPost: postId
                });
                await newNotification.save();
            }
        }

        res.status(200).json(post);
    } catch (error) {
        console.error(`Error in ${type} post controller: `, error.message);
        res.status(500).json({ msg: "Internal server error" });
    }
};

export const upvotePost = (req, res) => toggleVote(req, res, "upvote");
export const downvotePost = (req, res) => toggleVote(req, res, "downvote");


//========== let this be backup for upvotePost and downvotePost in case the top code doesnt work ================\\
// export const upvotePost = async (req, res) => {
//     try {
        
//         const userid = req.user._id;
//         const postid = req.params.id;
//         const post = await Post.findById(postid);

//         // if the post is not yet upvoted and is downvoted
//         if(!(post.upVotes.includes(userid)) && (post.downVotes.includes(userid))){
//             // upvote the post
//             post.upVotes.push(userid);
//             // remove downvote from the post
//             post.downVotes = post.downVotes.filter(id => id.toString() !== userid.toString());

//             // create notification if the post author is not the user who upvoted
//             if (post.author.toString() !== userid.toString()) {
//                 const newNotification = new Notification({
//                     receiver: post.author,
//                     type: "upvote",
//                     sender: userid,
//                     relatedPost: postid
//                 })

//                 await newNotification.save();
//             }

//         // if the post is not yet upvoted and is not downvoted    
//         }else if(!(post.downVotes.includes(userid)) && !(post.upVotes.includes(userid))){
//             // upvote the post
//             post.upVotes.push(userid);

//             // create notification if the post author is not the user who upvoted
//             if (post.author.toString() !== userid.toString()) {
//                 const newNotification = new Notification({
//                     receiver: post.author,
//                     type: "upvote",
//                     sender: userid,
//                     relatedPost: postid
//                 })

//                 await newNotification.save();

//             }

//         }else{
//             // un upvote the post
//             post.upVotes = post.upVotes.filter(id => id.toString() !== userid.toString());
//         }

//     } catch (error) {
//         console.error("error in upvote post controller: ", error.msg);
//         res.status(500).json({ msg: "Internal server error" });
//     }
// }
// export const downvotePost = async (req, res) => {
//     try {
        
//         const userid = req.user._id;
//         const postid = req.params.id;
//         const post = await Post.findById(postid);

//         // if the post is not yet downvoted and is upvoted
//         if(!(post.downVotes.includes(userid)) && (post.upVotes.includes(userid))){
//             // downvote the post
//             post.downVotes.push(userid);
//             // remove upvote from the post
//             post.upVotes = post.upVotes.filter(id => id.toString() !== userid.toString());

//             // create notification if the post author is not the user who downvoted
//             if (post.author.toString() !== userid.toString()) {
//                 const newNotification = new Notification({
//                     receiver: post.author,
//                     type: "downvote",
//                     sender: userid,
//                     relatedPost: postid
//                 })

//                 await newNotification.save();
//             }

//         // if the post is not yet downvoted and is not upvoted    
//         }else if(!(post.upVotes.includes(userid)) && !(post.downVotes.includes(userid))){
//             // downvote the post
//             post.downVotes.push(userid);

//             // create notification if the post author is not the user who downvoted
//             if (post.author.toString() !== userid.toString()) {
//                 const newNotification = new Notification({
//                     receiver: post.author,
//                     type: "downvote",
//                     sender: userid,
//                     relatedPost: postid
//                 })

//                 await newNotification.save();

//             }

//         }else{
//             // un downvote the post
//             post.downVotes = post.downVotes.filter(id => id.toString() !== userid.toString());
//         }

//     } catch (error) {
//         console.error("error in upvote post controller: ", error.msg);
//         res.status(500).json({ msg: "Internal server error" });
//     }
// }