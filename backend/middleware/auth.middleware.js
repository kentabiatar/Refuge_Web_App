import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies["jwt-fullstack1"];
        if (!token) {
            return res.status(401).json({ msg: "Not authorized - no token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userid).select("-password");
        
        if (!user) {
            return res.status(401).json({ msg: "Not authorized - user not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("error in protected route middleware: ", error.msg);
        res.status(500).json({ msg: "Server error" });
    }
}