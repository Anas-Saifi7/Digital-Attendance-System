
import crypto from "crypto";
import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createSession = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { subject, classRoom, startTime, endTime } = req.body;

    const qrToken = crypto.randomBytes(12).toString("hex");
    const session = new Session({
      subject,
      facultyId,
      classRoom,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      qrToken,
      // validUntil: new Date(endTime),
      validUntil: new Date(new Date(endTime).getTime() + 5 * 60 * 1000),

    });
    await session.save();

    res.json({
      sessionId: session._id.toString(),
      qrToken: session.qrToken,
      subject: session.subject,
      validUntil: session.validUntil,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAttendance = async (req, res) => {
  console.log("ATTENDANCE REQUEST BY:", req.user.id, req.user.role);

  try {
    const studentId = req.user.id;
    const { sessionId, qrToken } = req.body;
    if (!sessionId || !qrToken) return res.status(400).json({ error: "sessionId and qrToken required" });

    const session = await Session.findById(sessionId);
    if (!session) return res.status(400).json({ error: "Invalid session" });

        // 🚫 FACULTY ATTENDANCE BLOCK (PASTE HERE)
    if (String(session.facultyId) === String(studentId)) {
      return res
        .status(403)
        .json({ error: "Faculty cannot mark attendance" });
    }


    // check token
    if (session.qrToken !== qrToken) return res.status(400).json({ error: "Invalid QR token" });

    // check expiry
    if (session.validUntil && new Date() > new Date(session.validUntil)) {
      return res.status(400).json({ error: "Session expired" });
    }

    const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // prevent double-mark for same session
    const existing = await Attendance.findOne({ studentId, sessionId, date: dateStr });
    if (existing) return res.status(400).json({ error: "Already marked for this session" });

    const scanTime = new Date();
    let status = "Present";
    if (session.startTime) {
      const diffMinutes = (scanTime - new Date(session.startTime)) / 60000;
      if (diffMinutes > 5 && diffMinutes <= 15) {
        status = "Late";
      } else if (diffMinutes > 15) {
        status = "Absent";
      }
    }

    const attendance = await Attendance.create({
      studentId,
      subject: session.subject,
      date: dateStr,
      status,
      sessionId: session._id.toString(),
    });

    // create notification for student
    const notif = await Notification.create({
      userId: studentId,
      message: `Attendance ${status} for ${session.subject} on ${dateStr}`,
      type: "success",
    });

    // emit to student room
    req.io.to(studentId.toString()).emit("new_notification", notif);

    // optionally notify faculty
    const facultyNotif = await Notification.create({
      userId: session.facultyId,
      message: `Student ${studentId} marked ${status} for ${session.subject} on ${dateStr}`,
      type: "info",
    });
    req.io.to(session.facultyId.toString()).emit("new_notification", facultyNotif);

    res.json({ message: "Attendance marked", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



//   add new  
export const getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.find()
      .populate("studentId", "fullName rollNumber branch")
      .populate("sessionId", "subject startTime endTime");

    res.json(data);
  } catch (err) {
    console.error("Admin attendance fetch error:", err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};
