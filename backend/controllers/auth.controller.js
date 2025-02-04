import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        const {name, username, email, password} = req.body;

        if(!name || !username || !email || !password){
            return res.status(400).json({msg: "All fields are required"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({msg: "Invalid email format"});
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: "Username already exists" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        //hash password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); //encrypt password so not readable

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        })

        await newUser.save();

        const token = jwt.sign({ userid: newUser._id }, process.env.JWT_SECRET, {expiresIn: "3d"});

        res.cookie("jwt-fullstack1", token, {
            httpOnly:true, //prevent XSS attack
            maxAge: 3 * 24 * 60 * 60 * 1000, //3 days
            sameSite:"strict", //prevent CSRF attack
            secure: process.env.NODE_ENV === "production" //prevents man-in-the-middle attack
        })

        res.status(201).json({msg: "Signup successful"});

        //todo: send welcome email

    } catch (error) {
        console.log("error in signup controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({msg: "All fields are required"});
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({msg: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({msg: "Email/Password is invalid"});
        }

        const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET, {expiresIn: "3d"});

        res.cookie("jwt-fullstack1", token, {
            httpOnly:true, //prevent XSS attack
            maxAge: 3 * 24 * 60 * 60 * 1000, //3 days
            sameSite:"strict", //prevent CSRF attack
            secure: process.env.NODE_ENV === "production" //prevents man-in-the-middle attack
        })

        res.status(200).json({msg: "Login successful"});
    } catch (error) {
        console.error("error in login controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}
export const logout = (req, res) => {
    res.clearCookie("jwt-fullstack1");
    res.json({msg: "Logout successful"});
}

export const getCurrentUser = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error("error in get current user controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}