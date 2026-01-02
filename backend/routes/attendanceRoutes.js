// routes/attendanceRoutes.js
import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
// import { requireRole } from "../middleware/roleMiddleware.js";
import { createSession, markAttendance } from "../controllers/attendanceController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
// 
import { getAllAttendance } from "../controllers/attendanceController.js";
const router = express.Router();

// faculty creates session
router.post("/create-session", requireAuth, roleMiddleware(["Faculty", "Admin"]), createSession);

// student marks attendance (requires auth)
router.post("/mark", requireAuth, markAttendance);


router.get(
  "/all",
  requireAuth,
 roleMiddleware(["Admin"]),     // SIRF ADMIN ACCESS
  getAllAttendance
);

export default router;
