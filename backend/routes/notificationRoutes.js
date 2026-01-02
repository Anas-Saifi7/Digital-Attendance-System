// import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";
// import { requireRole } from "../middleware/roleMiddleware.js";
// import {
//   createNotification,
//   getStudentNotifications
// } from "../controllers/notificationController.js";
// import Notification from "../models/Notification.js";

// const router = express.Router();

// // ADMIN / FACULTY can create notification
// router.post(
//   "/",
//   authMiddleware,
//   requireRole(["Faculty", "Admin"]),
//   createNotification
// );

// // STUDENT fetch own notifications
// router.get("/student", authMiddleware, getStudentNotifications);

// // STUDENT — clear all notifications
// router.delete("/student/all", authMiddleware, async (req, res) => {
//   try {
//     const studentId = req.user.id;

//     await Notification.deleteMany({ studentId });

//     res.json({ message: "All notifications cleared" });
//   } catch (err) {
//     console.error("Clear notifications error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;



import express from "express";
import roleMiddleware from "../middleware/roleMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createNotification,
  getStudentNotifications,
  markNotificationRead,
  markAllRead
} from "../controllers/notificationController.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// ADMIN / FACULTY → create notification
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Faculty", "Admin"]),
  createNotification
);

// STUDENT → get notifications
router.get("/student", authMiddleware, getStudentNotifications);

// STUDENT → mark ONE read
router.put(
  "/student/:id/read",
  authMiddleware,
  markNotificationRead
);

// STUDENT → mark ALL read ✅
router.put(
  "/student/read-all",
  authMiddleware,
  markAllRead
);

// STUDENT → clear ALL
router.delete("/student/all", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
