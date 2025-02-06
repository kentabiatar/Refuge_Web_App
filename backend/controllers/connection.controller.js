import Connection from "../models/connectionReq.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const sendConnectionReq = async (req, res) => {
    try {
        const { userid } = req.params;
        const senderid = req.user._id;

        if(senderid.toString() === userid){
            return res.status(400).json({msg: "You cannot send connection request to yourself"});
        }

        if(req.user.connections.includes(userid)){
            return res.status(400).json({msg: "You already have a connection with this user"});
        }

        const existingRequest = await Connection.findOne({
            sender: senderid,
            receiver: userid,
            status: "pending"
        });

        if(existingRequest){
            return res.status(400).json({msg: "You already have a pending connection request with this user"});
        }

        const newRequest = new Connection({
            sender: senderid,
            receiver: userid
        });

        await newRequest.save();
        res.status(200).json({msg: "Connection request sent successfully"});
    } catch (error) {
        console.error("error in send connection request controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}

export const acceptConnectionReq = async (req, res) => {
    try {
        const { requestid } = req.params;
        const userid = req.user._id;

        const request = await Connection.findById(requestid);

        if(!request){    
            return res.status(404).json({msg: "Connection request not found"});
        }

        if(request.receiver._id.toString() !== userid.toString()){
            return res.status(403).json({msg: "You are not authorized to accept this connection request"});
        }

        if(request.status !== "pending"){
            return res.status(400).json({msg: "Connection request is not pending"});
        }

        request.status = "accepted";
        await request.save();

        // Add connection to both users
        await User.findByIdAndUpdate(request.sender._id, { $addToSet: { connections: userid } });
        await User.findByIdAndUpdate(userid, { $addToSet: { connections: request.sender._id } });

        
        const notification = new Notification({
            receiver: request.sender._id,
            type: "connectionAccepted",
            sender: userid
        });
        
        await notification.save();
        res.status(200).json({msg: "Connection accepted successfully"});
        
    } catch (error) {
        console.error("error in accept connection request controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}
export const rejectConnectionReq = async (req, res) => {
    try {
        const { requestid } = req.params;
        const userid = req.user._id;

        const request = await Connection.findById(requestid);

        if(!request){    
            return res.status(404).json({msg: "Connection request not found"});
        }

        if(request.receiver._id.toString() !== userid.toString()){
            return res.status(403).json({msg: "You are not authorized to reject this connection request"});
        }

        if(request.status !== "pending"){
            return res.status(400).json({msg: "Connection request is not pending"});
        }

        request.status = "rejected";
        await request.save();
        res.status(200).json({msg: "Connection rejected successfully"});
        
    } catch (error) {
        console.error("error in reject connection request controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}

export const getConnectionReq = async (req, res) => {
    try {
        const requests = await Connection.find({ receiver: req.user._id, status: "pending" })
        .populate("sender", "name username profileImage connections")
        .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error("error in get connection requests controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}

export const getConnections = async (req, res) => {
    try {
        userid = req.user._id;
        const user = await User.findById(userid)
        .populate("connections", "name username profileImage connections");

        res.status(200).json(user.connections);
    } catch (error) {
        console.error("error in get connections controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}

export const removeConnection = async (req, res) => {
    try {
        const myid = req.user._id;
        const { userid } = req.params;

        await User.findByIdAndUpdate(myid, { $pull: { connections: userid } });
        await User.findByIdAndUpdate(userid, { $pull: { connections: myid } });

        res.status(200).json({msg: "Connection removed successfully"});
    } catch (error) {
        console.error("error in remove connection controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}

export const getConnectionStatus = async (req, res) => {
    try {
        const { userid } = req.params;
        const myid = req.user._id;

        const me = req.user;
        if(me.connections.includes(userid)){
            return res.json({status: "connected"});
        }

        const pendingRequests = await Connection.find({
            $or: [
                { sender: userid, receiver: myid},
                { sender: myid, receiver: userid}
            ],
            status: "pending",
        })

        if(pendingRequests){
            if(pendingRequests.sender.toString() === myid.toString()){
                return res.json({status: "pending"});
            }else{
                return res.json({status: "received", requestid: pendingRequests._id});
            }
        }

        // if no connection or pending request found
        return res.json({status: "not connected"});
    } catch (error) {
        console.error("error in get connection status controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}