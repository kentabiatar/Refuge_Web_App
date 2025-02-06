import mongoose from "mongoose";

const connectionReqSchema = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    receiver: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    status: {type: String, eunim : ["pending", "accepted", "rejected"] ,default: "pending"},
    createdAt: {type: Date, default: Date.now}
});

const connectionReq = mongoose.model("ConnectionReq", connectionReqSchema);

export default connectionReq;