// // routes/studentRoutes.js
// import express from "express";
// import requireAuth from "../middleware/authMiddleware.js";
// import {
//   getMyProfile,
//   getMyAttendance,
//   getAttendanceSummary
// } from "../controllers/studentController.js";

// import Notification from "../models/Notification.js";


// const router = express.Router();

// router.get("/me", requireAuth, getMyProfile);
// router.get("/attendance", requireAuth, getMyAttendance);
// router.get("/summary", requireAuth, getAttendanceSummary);

// // notifications (student)
// router.get("/notifications", requireAuth, async (req, res) => {
//   try {
//     const list = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
//     res.json(list);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.put("/notifications/:id/read", requireAuth, async (req, res) => {
//   try {
//     await Notification.findByIdAndUpdate(req.params.id, { unread: false });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.delete("/notifications/:id", requireAuth, async (req, res) => {
//   try {
//     await Notification.findByIdAndDelete(req.params.id);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.delete("/notifications/all", requireAuth, async (req, res) => {
//   try {
//     await Notification.deleteMany({ userId: req.user.id });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // facultstudentdelete
// // DELETE route
// router.delete(
//   "/students/:id",
//   authMiddleware,
//   roleMiddleware(["admin", "faculty"]),
//   deleteStudent
// );


// export default router;


import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { updateStudent } from "../controllers/studentController.js";

import {
  getMyProfile,
  getMyAttendance,
  getAttendanceSummary,
  deleteStudent,
    getAllStudents
} from "../controllers/studentController.js";

import Notification from "../models/Notification.js";

const router = express.Router();
console.log("✅ studentRoutes loaded");


// ================= STUDENT ROUTES =================
router.get("/me", authMiddleware, getMyProfile);
router.get("/attendance", authMiddleware, getMyAttendance);
router.get("/summary", authMiddleware, getAttendanceSummary);

// ================= NOTIFICATIONS =================
router.get("/notifications", authMiddleware, async (req, res) => {
  const list = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(list);
});

router.put("/notifications/:id/read", authMiddleware, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { unread: false });
  res.json({ success: true });
});

router.delete("/notifications/:id", authMiddleware, async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.delete("/notifications/all", authMiddleware, async (req, res) => {
  await Notification.deleteMany({ userId: req.user.id });
  res.json({ success: true });
});

// ✅ GET ALL STUDENTS (Admin + Faculty + Student)
router.get(
  "/students",
  authMiddleware,
  getAllStudents
);


// ================= DELETE STUDENT =================
// Admin + Faculty only
router.delete(
  "/students/:id",
  authMiddleware,
  roleMiddleware(["admin", "faculty"]),
  deleteStudent
);

router.put(
  "/students/:id",
  authMiddleware,
  roleMiddleware(["admin", "faculty"]),
  updateStudent
);


export default router;
