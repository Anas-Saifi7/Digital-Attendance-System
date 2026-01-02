
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Style/attendancePage.css";

const FacultyAttendance = () => {

  // Selected date
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });

  // Attendance list from backend
  const [attendance, setAttendance] = useState([]);

  // Load attendance when date changes
  useEffect(() => {
    loadAttendance();
  }, [date]);

  const loadAttendance = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/faculty/attendance?date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttendance(res.data); // array of students with status
    } catch (err) {
      console.log("Attendance load error:", err);
    }
  };

  // Update attendance status
  const updateStatus = async (studentId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/faculty/attendance/mark",
        { studentId, date, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      loadAttendance();

    } catch (err) {
      console.log("Update status error:", err);
    }
  };

  // CSV download
  const downloadCSV = () => {
    let csv = "Name,Roll,Status,Date\n";

    attendance.forEach((s) => {
      csv += `${s.name},${s.roll},${s.status},${date}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Attendance_${date}.csv`;
    a.click();
  };

  return (
    <div className="att-page">
      <h2>Daily Attendance</h2>

      {/* Date Selector */}
      <div className="date-row">
        <label>Select Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Attendance Table */}
      <div className="att-card">
        <table className="att-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll</th>
              <th>Status</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.roll}</td>

                <td>
                  <span className={`badge ${s.status.toLowerCase()}`}>
                    {s.status}
                  </span>
                </td>

                <td>
                  <select
                    className="edit-select"
                    value={s.status}
                    onChange={(e) => updateStatus(s._id, e.target.value)}
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Buttons */}
      <div className="export-btns">
        <button className="csv-btn" onClick={downloadCSV}>
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default FacultyAttendance;
