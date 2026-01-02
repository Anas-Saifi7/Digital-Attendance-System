// controllers/studentController.js
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${user._id}`;

    res.json({ ...user.toObject(), qrCode });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const rows = await Attendance.find({ studentId }).sort({ date: -1 });

    // map to front-end expected format: { date, subject, status }
    const data = rows.map((r) => ({
      date: r.date,
      subject: r.subject,
      status: r.status,
      sessionId: r.sessionId,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.id;
    const records = await Attendance.find({ studentId });

    if (!records.length) {
      return res.json({
        overallAttendance: 0,
        monthlyAverage: 0,
        subjects: [],
      });
    }

    const present = records.filter(r => r.status === "Present" || r.status === "Late").length;
    const late = records.filter(r => r.status === "Late").length;
    const overall = Math.round((present / records.length) * 100);

    const map = {};
    records.forEach(r => {
      if (!map[r.subject]) map[r.subject] = { p: 0, t: 0 };
      map[r.subject].t++;
      if (r.status === "Present") map[r.subject].p++;
    });
    const subjects = Object.keys(map).map(s => ({ name: s, percent: Math.round((map[s].p / map[s].t) * 100) }));

    const monthKey = new Date().toISOString().slice(0, 7);
    const thisMonth = records.filter(r => r.date.startsWith(monthKey));
    const mp = thisMonth.filter(r => r.status === "Present").length;
    const monthly = thisMonth.length ? Math.round((mp / thisMonth.length) * 100) : 0;

    res.json({
      overallAttendance: overall,
      monthlyAverage: monthly,
      subjects,
      totalSessions: records.length,
      lateCount: late,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};
