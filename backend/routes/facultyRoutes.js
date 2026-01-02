// routes/facultyRoutes.js
import express from "express";
import requireAuth from "../middleware/authMiddleware.js";

import { 
  getFacultyStudents, 
  getFacultyReports,
  getFacultyAttendance,
  markFacultyAttendance,
  getStudentFullReport   // <-- THIS WAS MISSING
} from "../controllers/facultyController.js";

const router = express.Router();

// Protect all faculty routes
router.use(requireAuth);

// STUDENTS LIST
router.get("/students", getFacultyStudents);

// REPORTS LIST
router.get("/reports", getFacultyReports);

// DAILY ATTENDANCE
router.get("/attendance", getFacultyAttendance);

// MARK ATTENDANCE
router.post("/attendance/mark", markFacultyAttendance);

// FULL STUDENT REPORT (profile page)
router.get("/report/:studentId", getStudentFullReport);

export default router;
