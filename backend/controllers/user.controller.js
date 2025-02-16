import User from "../models/user.model.js"
import cloudinary from "../lib/cloudinary.js";


export const getSuggestedConnections = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id).select("connections");
        const suggestedConnections = await User.find({
            _id: {
                $ne: currentUser._id,
                $nin: currentUser.connections
            }
        }).select("name username profileImage bio").limit(3);

        res.json(suggestedConnections);
    } catch (error) {
        console.error("error in get suggested connections controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
        
    }
}

export const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        .select("-password")
        .populate({
            path: "posts",
            populate: { path: "author" }
        });
        
        if(!user){
            return res.status(404).json({msg: "User not found"});
        }
        res.json(user);
    } catch (error) {
        console.error("error in get public profile controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}

export const updateProfile = async (req, res) => {
    try {
        
        const allowedFields = ["name", "username", "profileImage", "bio"];
        const updatedFields = {};

        for(const field of allowedFields){
            if(req.body[field]){
                updatedFields[field] = req.body[field];
            }
        }

        if (updatedFields.username) {
            const existingUser = await User.findOne({ username: updatedFields.username });

            // if username exist and existing user != current user
            if (existingUser && existingUser._id.toString() !== req.user._id.toString()) { 
                return res.status(400).json({ msg: "Username already taken" });
            }
        }

        if(req.body.profileImage){
            const result = await cloudinary.uploader.upload(req.body.profileImage);
            updatedFields.profileImage = result.secure_url;
        }

        const user = await User.findByIdAndUpdate(req.user._id, updatedFields, {new: true}).select("-password");
        res.json(user);

    } catch (error) {
        console.error("error in update profile controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}