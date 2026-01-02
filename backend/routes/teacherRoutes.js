import express from "express";
import Teacher from "../models/Teacher.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


/* ------------------ GET ALL TEACHERS ------------------ */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

/* ------------------ ADD NEW TEACHER ------------------ */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.json({ msg: "Teacher added successfully", teacher });
  } catch (err) {
    res.status(500).json({ error: "Failed to add teacher", details: err });
  }
});

/* ------------------ UPDATE TEACHER ------------------ */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ msg: "Teacher updated", updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update teacher" });
  }
});

/* ------------------ DELETE TEACHER ------------------ */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ msg: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

export default router;
