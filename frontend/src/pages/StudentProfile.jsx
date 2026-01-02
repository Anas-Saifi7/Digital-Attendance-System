import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import "../Style/studentProfile.css";



const StudentProfile = () => {
  const API_BASE = import.meta.env.VITE_API_URL;
  const { state } = useLocation();
  const s = state?.student;

  if (!s) {
    return (
      <div className="profile-container">
        <h2>No Student Data Found</h2>
        <Link to="/students" className="back-btn">
          Go Back
        </Link>
      </div>
    );
  }



  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
  loadSummary();
 }, [s._id]);

  const loadSummary = async () => {
    try {
      const token = localStorage.getItem("token");

  const res = await axios.get(
  `${API_BASE}/api/faculty/report/${s._id}`,
  { headers: { Authorization: `Bearer ${token}` } }
);


      setAttendanceData({
        today: "Present",
        week: { present: 5, absent: 1, late: 0 },
        month: { present: 20, absent: 3, late: 2 },
        overall: res.data[0]?.attendance || 0,
      });
    } catch (err) {
      console.log("Profile report error:", err);
    }
  };

  if (!attendanceData) {
    return <h3 className="loading-text">Loading student details...</h3>;
  }

  const downloadCSV = () => {
    const csv = `

Name,${s.fullName}
Roll No,${s.rollNumber}
 Branch,${s.department}
Attendance %,${attendanceData.overall}
Present This Month,${attendanceData.month.present}
Absent This Month,${attendanceData.month.absent}
Late This Month,${attendanceData.month.late}
`;

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${s.name}_attendance.csv`;
    a.click();
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="profile-wrapper">
      {/* LEFT CARD */}
      <div className="left-card">
        {/* <h2>{s.name}</h2> */}
<h2>{s.fullName}</h2>
        <p>
          {/* <strong>Roll No:</strong> {s.roll} */}
          <strong>Roll No:</strong> {s.rollNumber}
        </p>
        <p>
          {/* <strong>Branch:</strong> {s.branch} */}
          <strong>Branch:</strong> {s.department}
        </p>
        <p>
          <strong>Subject:</strong> {s.subject || "N/A"}
        </p>

        <div className="divider"></div>

        <p>
          <strong>Address:</strong> {s.address || "N/A"}
        </p>

        <div className="divider"></div>

        <p>
          <strong>Email:</strong> {s.email}
        </p>
        <p>
          <strong>Phone:</strong> {s.phone || "N/A"}
        </p>

        <div className="divider"></div>

        <p>
          <strong>Today Status:</strong>
          <span className={`badge ${attendanceData.today.toLowerCase()}`}>
            {attendanceData.today}
          </span>
        </p>

        <p>
          <strong>Overall Attendance:</strong>
          <span className="badge attendance">{attendanceData.overall}%</span>
        </p>

        <Link to="/students" className="back-btn">
          ← Back
        </Link>
      </div>

      {/* RIGHT CARD */}
      <div className="right-card">
        <h3>Attendance Summary</h3>

        <div className="today-box">
          <h4>Today</h4>
          <span className={`badge ${attendanceData.today.toLowerCase()}`}>
            {attendanceData.today}
          </span>
        </div>

        <div className="analytics-row">
          <div className="analytics-card">
            <h4>This Week</h4>
            <p>Present: {attendanceData.week.present}</p>
            <p>Absent: {attendanceData.week.absent}</p>
            <p>Late: {attendanceData.week.late}</p>
          </div>

          <div className="analytics-card">
            <h4>This Month</h4>
            <p>Present: {attendanceData.month.present}</p>
            <p>Absent: {attendanceData.month.absent}</p>
            <p>Late: {attendanceData.month.late}</p>
          </div>
        </div>

        <div className="overall-box">
          <h4>Overall Attendance</h4>
          <h1>{attendanceData.overall}%</h1>
        </div>

        <div className="download-row">
          <button onClick={downloadPDF} className="pdf-btn">
            Download PDF
          </button>
          <button onClick={downloadCSV} className="csv-btn">
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

