import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({

    receiver: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    type: {type:"String", required: true, enum: ["like", "comment","connectionAccepted"]},
    sender: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    relatedPost: {type: mongoose.Schema.Types.ObjectId, ref: "Post"},
    seen: {type: Boolean, default: false}

}, {timestamps: true});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;