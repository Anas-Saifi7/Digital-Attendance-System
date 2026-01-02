import React, { useState, useEffect } from "react";
import "../Style/studentD.css";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiBarChart2, FiBell } from "react-icons/fi";
// import { FiFileText } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";


import axios from "axios";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const StudentDashboard = () => {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const location = useLocation();

  const [student, setStudent] = useState(null);
  const [qrCode, setQrCode] = useState("");

  const [summary, setSummary] = useState(null);
const [notifications, setNotifications] = useState([]);

  // Fetch student profile
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/student/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudent(res.data);

        // 
        
        // Auto generate QR
const qrData = JSON.stringify({
  studentId: res.data._id,
  name: res.data.fullName,
  roll: res.data.roll,
  time: Date.now()
});

const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
setQrCode(qr);


      } catch (err) {
        console.log("Error fetching profile:", err);
      }
    };

    fetchStudent();
  }, []);

  // Fetch Attendance Summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/student/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSummary(res.data);
      } catch (err) {
        console.log("Error fetching summary:", err);
      }
    };

    fetchSummary();
  }, []);

  const handleSearch = () => {
    if (!searchText.trim()) {
      alert("Please enter something to search!");
      return;
    }
    alert("You searched: " + searchText);
  };

  // ==================== DOUGHNUT CHARTS ====================

  const overallData = {
    datasets: [
      {
        data: summary
          ? [summary.overallAttendance, 100 - summary.overallAttendance]
          : [0, 100],
        backgroundColor: ["#0b5ed7", "#e5e7eb"],
        borderWidth: 0,
        cutout: "72%",
      },
    ],
  };

  const monthlyData = {
    datasets: [
      {
        data: summary
          ? [summary.monthlyAverage, 100 - summary.monthlyAverage]
          : [0, 100],
        backgroundColor: ["#22c55e", "#e5e7eb"],
        borderWidth: 0,
        cutout: "72%",
      },
    ],
  };

  // ==================== BAR CHART ====================
const barData = {
  labels: summary?.subjects ? summary.subjects.map(s => s.name) : [],
  datasets: [
    {
      label: "Attendance %",
      data: summary?.subjects ? summary.subjects.map(s => s.percent) : [],
      backgroundColor: "#0b5ed7",
      borderRadius: 8,
    },
  ],
};

const recentNotifications = notifications
  .filter((n) => !n.isRead)
  .slice(0, 3);



useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/student/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(res.data);
    } catch (err) {
      console.log("Error fetching notifications:", err);
    }
  };

  fetchNotifications();
}, []);


  return (
    <div className="stu-dashboard-root">

      {/* SIDEBAR */}
      <aside className={`stu-sidebar ${open ? "open" : ""}`}>
        <h2 className="stu-logo">{student?.fullName || "Student"}</h2>
 

       

        <button className="stu-close-btn" onClick={() => setOpen(false)}>✖</button>

        <nav className="stu-side-nav">
          <Link
            to="/student-dashboard"
            className={location.pathname === "/student-dashboard" ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            <FiHome className="stu-nav-icon" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/reports"
            className={location.pathname === "/reports" ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            <FiBarChart2 className="stu-nav-icon" />
            <span>Reports</span>
          </Link>

          <Link
            to="/notifications"
            className={location.pathname === "/notifications" ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            <FiBell className="stu-nav-icon" />
            <span>Notifications</span>
          </Link>

          <Link
            className={location.pathname === "/student/scan" ? "active" : ""}
            to="/student/scan"
          >
            <FiUsers /> Scan Attendance
          </Link>


        </nav>
      </aside>

      {open && <div className="stu-sidebar-backdrop" onClick={() => setOpen(false)}></div>}

      {/* MAIN AREA */}
      <div className="stu-main-area">

        {/* TOPBAR */}
        <div className="stu-topbar">
          <button className="stu-hamburger" onClick={() => setOpen(true)}>☰</button>

          <div className="stu-topbar-right">

            {/* SEARCH BAR */}
            <div className="stu-search-box">
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button className="stu-submit" onClick={handleSearch}>
              Submit
            </button>

            {/* DOWNLOAD QR BUTTON */}
            <button
              className="stu-download-btn"
              onClick={() => {
                const link = document.createElement("a");
                link.href = qrCode;
                link.download = `${student?.fullName || "qr"}.png`;
                link.click();
              }}
            >
              Download QR
            </button>

          </div>
        </div>

        {/* DASHBOARD CONTAINER */}
        <div className="stu-dashboard-container">

          {/* WELCOME TEXT */}
          <h2 className="stu-welcome-text">
            Welcome Back, {student ? student.fullName : "Loading..."}
          </h2>

          {/* CIRCLE CARDS */}
          <div className="stu-row-cards">

            {/* OVERALL */}
            <div className="stu-card stu-circle-card">
              <div className="stu-circle-wrap">
                <Doughnut data={overallData} options={{ plugins: { legend: { display: false } } }} />
                <div className="stu-circle-center">
                  {summary ? summary.overallAttendance : 0}%
                </div>
              </div>
              <p className="stu-circle-title">Overall Attendance</p>
            </div>

            {/* MONTHLY */}
            <div className="stu-card stu-circle-card">
              <div className="stu-circle-wrap">
                <Doughnut data={monthlyData} options={{ plugins: { legend: { display: false } } }} />
                <div className="stu-circle-center">
                  {summary ? summary.monthlyAverage : 0}%
                </div>
              </div>
              <p className="stu-circle-title">Monthly Average</p>
            </div>

          </div>

          {/* MAIN ROW */}
          <div className="stu-row-main">

            <div className="stu-card stu-chart-card">
              <h3>Subject-wise Attendance</h3>
              <Bar data={barData} />
            </div>

            <div className="stu-card stu-notify-card">
              <h3>Recent Notifications</h3>

            {recentNotifications.length === 0 ? (
    <p className="stu-empty">No recent notifications</p>
  ) : (
    recentNotifications.map((n) => (
      <p key={n._id} className={`stu-notice ${n.type || "info"}`}>
        <span className="dot"></span>
        {n.message}
      </p>
    ))
)}

  <Link to="/notifications" className="view-all textdecoration-none">
    View All
  </Link>


            </div>



          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
