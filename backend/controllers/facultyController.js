
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

const getLatestAttendanceMap = (records) => {
  const map = new Map();
  records.forEach((record) => {
    const key = record.studentId.toString();
    if (!map.has(key)) map.set(key, record);
  });
  return map;
};

// GET ALL STUDENTS
export const getFacultyStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "Student" })
      .select("fullName email rollNumber department phone address")
      .lean();

    const studentIds = students.map((s) => s._id);
    const latestRecords = await Attendance.find({
      studentId: { $in: studentIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    const latestMap = getLatestAttendanceMap(latestRecords);

    const formatted = students.map((stu) => {
      const last = latestMap.get(stu._id.toString());
      return {
        _id: stu._id,
        name: stu.fullName,
        roll: stu.rollNumber || "N/A",
        branch: stu.department || "N/A",
        subject: last?.subject || "N/A",
        status: last?.status || "Not Marked",
        email: stu.email,
        phone: stu.phone || "",
        address: stu.address || "",
        lastMarkedOn: last?.date || null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("faculty students error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// REPORTS
export const getFacultyReports = async (req, res) => {
  try {
    const { branch, subject } = req.query;

    const students = await User.find({ role: "Student" })
      .select("fullName rollNumber department")
      .lean();
    const studentIds = students.map((s) => s._id);

    const attendanceRecords = await Attendance.find({
      studentId: { $in: studentIds },
    }).lean();

    const grouped = {};
    const subjectMap = {};
    attendanceRecords.forEach((rec) => {
      const sid = rec.studentId.toString();
      if (!grouped[sid]) grouped[sid] = { total: 0, present: 0 };
      grouped[sid].total += 1;
      if (rec.status === "Present") grouped[sid].present += 1;

      if (!subjectMap[sid]) subjectMap[sid] = new Set();
      subjectMap[sid].add(rec.subject);
    });

    const formatted = await Promise.all(
      students.map(async (s) => {
        const sid = s._id.toString();
        const stats = grouped[sid];
        const percent =
          stats && stats.total ? Math.round((stats.present / stats.total) * 100) : 0;

        const subjects = subjectMap[sid]
          ? Array.from(subjectMap[sid])
          : [];

        return {
          id: s._id,
          name: s.fullName,
          branch: s.department || "N/A",
          subject: subjects[0] || "N/A",
          subjects,
          attendance: percent,
        };
      })
    );

    let filtered = formatted;
    if (branch && branch !== "All") {
      filtered = filtered.filter(
        (item) => (item.branch || "N/A").toLowerCase() === branch.toLowerCase()
      );
    }
    if (subject && subject !== "All") {
      filtered = filtered.filter(
        (item) =>
          item.subject === subject ||
          (item.subjects || []).some((sub) => sub === subject)
      );
    }

    res.json(filtered);
  } catch (err) {
    console.error("faculty report error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// ATTENDANCE LIST
export const getFacultyAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) return res.status(400).json({ msg: "Date required" });

    const records = await Attendance.find({ date })
      .sort({ createdAt: -1 })
      .populate("studentId", "fullName rollNumber department")
      .lean();

    const uniqueMap = new Map();
    records.forEach((r) => {
      const student = r.studentId;
      if (!student) return;
      const sid = student._id.toString();
      if (uniqueMap.has(sid)) return;
      uniqueMap.set(sid, {
        _id: sid,
        attendanceId: r._id,
        name: student.fullName,
        roll: student.rollNumber || "N/A",
        subject: r.subject,
        status: r.status,
        branch: student.department || "N/A",
        markedAt: r.createdAt,
      });
    });

    const formatted = Array.from(uniqueMap.values());

    res.json(formatted);

  } catch (err) {
    console.log("Attendance list error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// MARK ATTENDANCE
export const markFacultyAttendance = async (req, res) => {
  try {
    const { studentId, status, date } = req.body;

    if (!studentId || !status || !date)
      return res.status(400).json({ msg: "Missing fields" });

    const subject = "General";

    let record = await Attendance.findOne({ studentId, date });

    if (record) {
      record.status = status;
      await record.save();
    } else {
      await Attendance.create({
        studentId,
        date,
        status,
        subject,
        sessionId: "manual-entry",
      });
    }

    res.json({ msg: "Attendance updated" });

  } catch (err) {
    console.log("Mark error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};


export const getStudentFullReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select(
      "fullName rollNumber department email phone"
    );
    if (!student)
      return res.status(404).json({ msg: "Student not found" });

    const all = await Attendance.find({ studentId });

    // TODAY
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = all.find((a) => a.date === today);
    const todayStatus = todayRecord ? todayRecord.status : "Absent";

    // WEEK SUMMARY
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const week = all.filter((a) => new Date(a.date) >= weekStart);

    const weekSummary = {
      present: week.filter((a) => a.status === "Present").length,
      absent: week.filter((a) => a.status === "Absent").length,
      late: week.filter((a) => a.status === "Late").length,
    };

    // MONTH SUMMARY
    const monthStart = new Date();
    monthStart.setDate(1); // 1st of current month

    const month = all.filter((a) => new Date(a.date) >= monthStart);

    const monthSummary = {
      present: month.filter((a) => a.status === "Present").length,
      absent: month.filter((a) => a.status === "Absent").length,
      late: month.filter((a) => a.status === "Late").length,
    };

    // OVERALL
    const presentCount = all.filter((a) => a.status === "Present").length;
    const overallPercent = all.length
      ? Math.round((presentCount / all.length) * 100)
      : 0;

    return res.json({
      today: todayStatus,
      week: weekSummary,
      month: monthSummary,
      overall: overallPercent,
    });

  } catch (err) {
    console.log("Student report error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};
