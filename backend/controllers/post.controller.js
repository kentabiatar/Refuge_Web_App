import cloudinary from "../lib/cloudinary.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getFeedPosts = async (req, res) => {
    try {
        const posts = await Post.find({ 
            parent: null // 🔥 Exclude comments (only fetch main posts)
        })
        // author: { $in: [...req.user.connections, req.user._id] },
        .populate("author", "name username profileImage bio")
        .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error in getFeedPosts controller:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
};


export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        .populate("author", "name username profileImage bio");

        if(!post){
            return res.status(404).json({msg: "Post not found"});
        }

        const comment = await Post.find({parent: req.params.id})
        .populate("author", "name username profileImage bio");

        res.status(200).json({post, comment});
    } catch (error) {
        console.error("error in get post by id controller: ", error.msg);
        res.status(500).json({ msg: "Internal server error" });
    }
}

export const createComment = async (req, res) => {
    try {
        const { content, image } = req.body;
        const {id: parentId} = req.params;

        const parentPost = await Post.findById(parentId).populate("author", "name username profileImage bio");
        if(!parentPost){
            return res.status(404).json({msg: "Parent post not found"});
        }

        // Prepare comment object
        const commentData = { author: req.user._id, content, parent: parentId };

        // Upload image if provided
        if (image) {
            const imageResult = await cloudinary.uploader.upload(image);
            commentData.image = imageResult.secure_url;
        }

        // Update post with new comment
        const comment = (await Post.create(commentData));
        await User.findByIdAndUpdate(req.user._id, { $push: { posts: comment._id } });

        // Create notification if the commenter is not the post owner
        if (parentPost.author._id.toString() !== req.user._id.toString()) {
            await new Notification({
                receiver: parentPost.author,
                type: "comment",
                sender: req.user._id,
                relatedPost: req.params.id
            }).save();
        }

        res.status(200).json(comment);
    } catch (error) {
        console.error("Error in create comment controller:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

export const createPost = async (req, res) => {
    try {
        const {content, image} = req.body;
        let newPost;

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

        await User.findByIdAndUpdate(req.user._id, { $push: { posts: newPost._id } });
        res.status(201).json(newPost);

    } catch (error) {

        console.error("error in create post controller: ", error.msg);
        res.status(500).json({ msg: "Internal server error" });
        
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: "Not authorized" });
        }

        // Delete post image from Cloudinary (if it exists)
        if (post.image) {
            await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]);
        }

        // Find all child posts (comments/replies)
        const childPosts = await Post.find({ parent: post._id });

        // Remove child posts from their respective authors
        await User.updateMany(
            { _id: { $in: childPosts.map(post => post.author) } },
            { $pull: { posts: { $in: childPosts.map(post => post._id) } } }
        );

        // Delete all child posts
        await Post.deleteMany({ parent: post._id });

        // Delete the main post
        await Post.findByIdAndDelete(req.params.id);

        // Remove the post ID from the original author's posts array
        await User.findByIdAndUpdate(req.user._id, { $pull: { posts: post._id } });

        res.status(200).json({ msg: "Post and all child posts deleted successfully" });

    } catch (error) {
        console.error("Error in deletePost controller: ", error.message);
        res.status(500).json({ msg: "Internal server error" });
    }
};

const toggleVote = async (req, res, type) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        const isUpvoted = post.upVotes.includes(userId);
        const isDownvoted = post.downVotes.includes(userId);

        let action = "neutral"; // Default state

        // Toggle upvote
        if (type === "upvote") {
            if (isUpvoted) {
                post.upVotes = post.upVotes.filter(id => id.toString() !== userId.toString());
                action = "neutral";
            } else {
                post.upVotes.push(userId);
                post.downVotes = post.downVotes.filter(id => id.toString() !== userId.toString()); // Remove downvote if exists
                action = "upvote";
            }
        } 
        // Toggle downvote
        else if (type === "downvote") {
            if (isDownvoted) {
                post.downVotes = post.downVotes.filter(id => id.toString() !== userId.toString());
                action = "neutral";
            } else {
                post.downVotes.push(userId);
                post.upVotes = post.upVotes.filter(id => id.toString() !== userId.toString()); // Remove upvote if exists
                action = "downvote";
            }
        }

        await post.save();

        // Prevent duplicate notifications
        const existingNotification = await Notification.findOne({
            type,
            sender: userId,
            relatedPost: postId,
        });

        if (action === "neutral") {
            // Remove existing notification if user unvotes
            if (existingNotification) {
                await Notification.findByIdAndDelete(existingNotification._id);
            }
        } else if (!existingNotification && post.author.toString() !== userId.toString()) {
            // Create notification only if it doesn’t exist
            const newNotification = new Notification({
                receiver: post.author,
                type,
                sender: userId,
                relatedPost: postId,
            });
            await newNotification.save();
        }

        res.status(200).json(post);
    } catch (error) {
        console.error(`Error in ${type} post controller: `, error.message);
        res.status(500).json({ msg: "Internal server error" });
    }
};

export const upvotePost = (req, res) => toggleVote(req, res, "upvote");
export const downvotePost = (req, res) => toggleVote(req, res, "downvote");

export const getCommentsForPost = async (req, res) => {
    try {
        const comments = await Post.find({ parent: req.params.id })
        .populate("author", "name username profileImage bio")
        .sort({ createdAt: -1 }); // Sort by (upVotes - downVotes) in descending order
        
        res.status(200).json(comments);
    } catch (error) {
        console.error("Error in getCommentsForPost:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

//========== let this be backup for toggle vote in case the top code doesnt work ================\\

// const toggleVote = async (req, res, type) => {
//     try {
    //         const userId = req.user._id;
//         const postId = req.params.id;
//         const post = await Post.findById(postId);
//         if (!post) return res.status(404).json({ msg: "Post not found" });

//         const isUpvoted = post.upVotes.includes(userId);
//         const isDownvoted = post.downVotes.includes(userId);

//         // toggle upvote and able to stay neutral
//         if (type === "upvote") {
//             if (!isUpvoted && isDownvoted) {
//                 post.downVotes = post.downVotes.filter(id => id.toString() !== userId.toString());
//                 post.upVotes.push(userId);
//             } else if (!isUpvoted) {
//                 post.upVotes.push(userId);
//             } else {
//                 post.upVotes = post.upVotes.filter(id => id.toString() !== userId.toString());
//             }
        
//         // toggle downvote and able to stay neutral
//         } else if (type === "downvote") {
//             if (!isDownvoted && isUpvoted) {
//                 post.upVotes = post.upVotes.filter(id => id.toString() !== userId.toString());
//                 post.downVotes.push(userId);
//             } else if (!isDownvoted) {
//                 post.downVotes.push(userId);
//             } else {
//                 post.downVotes = post.downVotes.filter(id => id.toString() !== userId.toString());
//             }
//         }

//         await post.save();

//         // Create notification if the user is not the post owner (no notif if user is neutral)
//         if ((type === "upvote" && !isUpvoted) || (type === "downvote" && !isDownvoted)) {
//             if (post.author.toString() !== userId.toString()) {
//                 const newNotification = new Notification({
//                     receiver: post.author,
//                     type,
//                     sender: userId,
//                     relatedPost: postId
//                 });
//                 await newNotification.save();
//             }
//         }

//         res.status(200).json(post);
//     } catch (error) {
//         console.error(`Error in ${type} post controller: `, error.message);
//         res.status(500).json({ msg: "Internal server error" });
//     }
// };


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

