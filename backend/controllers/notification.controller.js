import Notification from "../models/notification.model.js";

export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({receiver: req.user._id})
        .sort({createdAt: -1})
        .populate("sender", "name username profileImage")
        .populate("relatedPost", "content image author createdAt");
        

        res.status(200).json(notifications);
    } catch (error) {
        console.error("error in get user notifications controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}

export const markNotificationAsSeen = async (req, res) => {
    notificationid = req.params.id;
    try {
        const notification = await Notification.findByIdAndUpdate({
            _id: notificationid,
            receiver: req.user._id
        }, {seen: true}, {new: true});

        res.status(200).json(notification);
    } catch (error) {
        console.error("error in mark notification as seen controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}

export const deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete({
            _id: req.params.id,
            receiver: req.user._id
        });
        res.status(200).json({msg: "Notification deleted successfully"});
    } catch (error) {
        console.error("error in delete notification controller: ", error.msg);
        res.status(500).json({msg: "Internal server error"});
    }
}