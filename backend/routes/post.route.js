import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getFeedPosts, createPost, deletePost, getPostById, createComment, upvotePost, downvotePost, getCommentsForPost } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", protectRoute, getFeedPosts);
router.get("/:id", protectRoute, getPostById);
router.post("/:id/comment", protectRoute, createComment);
router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.post("/:id/upvote", protectRoute, upvotePost);
router.post("/:id/downvote", protectRoute, downvotePost);
router.get("/:id/comments", protectRoute, getCommentsForPost);


export default router;