import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendConnectionReq, acceptConnectionReq, rejectConnectionReq, getConnectionReq, getConnections, removeConnection, getConnectionStatus } from "../controllers/connection.controller.js";

const router = express.Router();

router.post("/request/:userid", protectRoute, sendConnectionReq);
router.put("/accept/:requestid", protectRoute, acceptConnectionReq);
router.put("/reject/:requestid", protectRoute, rejectConnectionReq);
// get all connection requests for current user
router.get("/requests", protectRoute, getConnectionReq);
// get connection for current user
router.get("/", protectRoute, getConnections);
router.delete("/:userid", protectRoute, removeConnection);
router.get("/status/:userid", protectRoute, getConnectionStatus);

export default router;