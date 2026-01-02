import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";

const router = express.Router();

// All admin routes require auth
router.use(authMiddleware);


// STUDENT: GET ALL
router.get("/students", async (req, res) => {
  try {
    const list = await Student.find();
    res.json(list);
  } catch (e) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// STUDENT: ADD
router.post("/students", async (req, res) => {
  try {
    const s = await Student.create(req.body);
    res.json(s);
  } catch {
    res.status(500).json({ msg: "Error adding student" });
  }
});

// STUDENT DELETE
router.delete("/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch {
    res.status(500).json({ msg: "Error deleting" });
  }
});

/* ------------------ TEACHERS ------------------- */

// GET TEACHERS
router.get("/teachers", async (req, res) => {
  try {
    const tList = await Teacher.find();
    res.json(tList);
  } catch {
    res.status(500).json({ msg: "Error fetching teachers" });
  }
});

// ADD TEACHER
router.post("/teachers", async (req, res) => {
  try {
    const t = await Teacher.create(req.body);
    res.json(t);
  } catch {
    res.status(500).json({ msg: "Error adding teacher" });
  }
});

// UPDATE TEACHER
router.put("/teachers/:id", async (req, res) => {
  try {
    const t = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(t);
  } catch {
    res.status(500).json({ msg: "Error updating" });
  }
});

// DELETE TEACHER
router.delete("/teachers/:id", async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch {
    res.status(500).json({ msg: "Error deleting" });
  }
});

// USER (STUDENT PROFILE): UPDATE  — Admin / Faculty
router.put("/users/:id", async (req, res) => {
  try {
    if (!["Admin", "Faculty"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName: req.body.fullName,
        rollNumber: req.body.rollNumber,
        department: req.body.department,
        phone: req.body.phone,
        address: req.body.address,
      },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error("User update error:", err);
    res.status(500).json({ msg: "Error updating user" });
  }
});


export default router;
