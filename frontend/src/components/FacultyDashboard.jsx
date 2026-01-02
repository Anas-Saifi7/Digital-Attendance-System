const API_BASE = import.meta.env.VITE_API_URL;

import React, { useState, useEffect, useMemo } from "react";
import { FiHome, FiUsers, FiFileText, FiBarChart2 } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import "../Style/facultyD.css";
import axios from "axios";
// import { io } from "socket.io-client";
import { socket } from "../socket";


const FacultyDashboard = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // 🔍 Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortType, setSortType] = useState("none");

  // 🔔 Notifications
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.read).length;
// const facultyName = localStorage.getItem("fullName");
const facultyName = localStorage.getItem("facultyName");

  const markAsRead = async (notifId) => {
    try {
      const token = localStorage.getItem("token");
   await axios.put(
  `${API_BASE}/api/student/notifications/${notifId}/read`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);


      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notifId || n.id === notifId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  // 👨‍🎓 Student List
  const [studentList, setStudentList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // 📊 Attendance % (backend se fetch hoga)
  const [attendancePercent, setAttendancePercent] = useState(0);

  // 📅 Today's attendance snapshot
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState({
    Present: 0,
    Late: 0,
    Absent: 0,
  });



  useEffect(() => {
  refreshAll();

  const user = JSON.parse(localStorage.getItem("user"));
  if (user?._id && !socket.connected) {
    socket.connect();
    socket.emit("join_faculty", user._id);
  }

  socket.on("new_notification", (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  });

  return () => {
    socket.off("new_notification");
  };
}, []);


  /* ------------------- API FUNCTIONS ------------------ */

  const refreshAll = () => {
    fetchStudents();
    fetchAttendancePercent();
    fetchNotifs();
    fetchTodayAttendance();
  };

  // GET STUDENT LIST
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const token = localStorage.getItem("token");

    const res = await axios.get(
  `${API_BASE}/api/faculty/students`,
  { headers: { Authorization: `Bearer ${token}` } }
);


      setStudentList(res.data);
    } catch (err) {
      console.error("Fetch students error:", err);
      setStudentList([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // GET ATTENDANCE %
  const fetchAttendancePercent = async () => {
    try {
      const token = localStorage.getItem("token");

    const res = await axios.get(
  `${API_BASE}/api/faculty/reports`,
  { headers: { Authorization: `Bearer ${token}` } }
);


      // Calculate overall attendance average
      if (res.data.length > 0) {
        const total = res.data.reduce((acc, s) => acc + s.attendance, 0);
        const avg = Math.round(total / res.data.length);
        setAttendancePercent(avg);
      } else {
        setAttendancePercent(0);
      }
    } catch (err) {
      console.error("Attendance % error:", err);
    }
  };


  // GET NOTIFICATIONS
  const fetchNotifs = async () => {
    try {
      const token = localStorage.getItem("token");

   const res = await axios.get(
  `${API_BASE}/api/notifications/student`,
  { headers: { Authorization: `Bearer ${token}` } }
);


      setNotifications(res.data || []);
    } catch (err) {
      console.error("Notifications fetch error:", err);
      setNotifications([]);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const today = new Date().toISOString().slice(0, 10);
    const res = await axios.get(
  `${API_BASE}/api/faculty/attendance?date=${today}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

      const rows = res.data || [];
      setTodayAttendance(rows);
      const counts = rows.reduce(
        (acc, row) => {
          const key = row.status || "Present";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        { Present: 0, Late: 0, Absent: 0 }
      );
      setStatusBreakdown({
        Present: counts.Present || 0,
        Late: counts.Late || 0,
        Absent: counts.Absent || 0,
      });
    } catch (err) {
      console.error("Today attendance error:", err);
      setTodayAttendance([]);
      setStatusBreakdown({ Present: 0, Late: 0, Absent: 0 });
    }
  };

  /* ---------------------- FILTERING ---------------------- */
  const branchOptions = useMemo(() => {
    const set = new Set(
      studentList.map((s) => s.branch || "Unassigned")
    );
    return ["All", ...Array.from(set)];
  }, [studentList]);

  const filteredStudents = studentList
    .filter((s) =>
      (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll || "").toString().includes(searchQuery)
    )
    .filter((s) =>
      branchFilter === "All" ? true : (s.branch || "Unassigned") === branchFilter
    )
    .filter((s) =>
      statusFilter === "All"
        ? true
        : (s.status || "").toLowerCase() === statusFilter.toLowerCase()
    )
    .sort((a, b) => {
      if (sortType === "az") return a.name.localeCompare(b.name);
      if (sortType === "za") return b.name.localeCompare(a.name);
      if (sortType === "roll-asc") return String(a.roll).localeCompare(String(b.roll));
      if (sortType === "roll-desc") return String(b.roll).localeCompare(String(a.roll));
      return 0;
    });

  /* ----------------------- UI ---------------------------- */
  return (
    <div className="faculty-root">
      {/* ------------------ SIDEBAR ------------------ */}
      <aside className={`f-sidebar ${open ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setOpen(false)}>✖</button>
        {/* <div className="f-logo">Faculty</div> */}
<div className="f-logo">{facultyName || "Faculty"}</div>

        <nav className="f-nav">
          <Link className={location.pathname === "/faculty/dashboard" ? "active" : ""} to="/faculty/dashboard">
            <FiHome /> Dashboard
          </Link>

          <Link
  to="/faculty/students"
  className={location.pathname === "/faculty/students" ? "active" : ""}
>
  <FiUsers /> Students
</Link>

<Link
  to="/faculty/attendance"
  className={location.pathname === "/faculty/attendance" ? "active" : ""}
>
  <FiBarChart2 /> Attendance
</Link>


          <Link className={location.pathname === "/faculty-reports" ? "active" : ""} to="/faculty/reports">
            <FiFileText /> Reports
          </Link>



<Link
  to="/faculty/create-session"
  className={location.pathname === "/faculty/create-session" ? "active" : ""}
  onClick={() => setOpen(false)}
>
  <FiFileText className="stu-nav-icon" />
  <span>Create Session</span>
</Link>
        </nav>
      </aside>

      {open && <div className="backdrop" onClick={() => setOpen(false)} />}

      {/* ------------------ MAIN AREA ------------------ */}
      <div className="f-main">
        {/* HEADER */}
        <header className="f-header">
          <button className="ham-btn" onClick={() => setOpen(true)}>☰</button>
          <h2>Faculty Dashboard</h2>

          <div className="f-header-actions">
            <button className="mark-btn" onClick={() => setShowNotif(true)}>
              Notifications
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
          </div>
        </header>

        {/* NOTIFICATION PANEL */}
        {showNotif && (
          <div className="notif-panel">
            <div className="notif-header">
              <h3>Notifications</h3>
              <button className="close-notif" onClick={() => setShowNotif(false)}>✖</button>
            </div>

            <div className="notif-list">
              {notifications.map((n) => (
                <div key={n._id ?? n.id} className={`notif-item ${!n.read ? "unread" : ""}`}>
                  <p className="title">{n.message?.slice(0, 30) || "Notification"}</p>
                  <p className="msg">{n.message}</p>

                  {!n.read && (
                    <button
                      className="mark-read-btn"
                      onClick={() => markAsRead(n._id ?? n.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))}

              {notifications.length === 0 && <p>No notifications yet</p>}
            </div>
          </div>
        )}

        {/* ------------------ STATS ------------------ */}
        <section className="f-stats">
          <div className="stat-card">
            <p>Total Students</p>
            <h1>{studentList.length}</h1>
          </div>

          <div className="stat-card">
            <p>Attendance %</p>
            <h1>{attendancePercent}%</h1>
          </div>

          <div className="stat-card">
            <p>Present Today</p>
            <h1>{statusBreakdown.Present}</h1>
          </div>
          <div className="stat-card">
            <p>Late Today</p>
            <h1>{statusBreakdown.Late}</h1>
          </div>
          <div className="stat-card">
            <p>Absent Today</p>
            <h1>{statusBreakdown.Absent}</h1>
          </div>
        </section>

        {/* ------------------ FILTERS ------------------ */}
        <section className="filters">
          <input
            type="text"
            placeholder="Search Name or Roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            {branchOptions.map((branch) => (
              <option key={branch} value={branch}>
                {branch === "All"
                  ? "All Branches"
                  : branch === "Unassigned"
                  ? "Unassigned"
                  : branch}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
          </select>

          <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="none">Sort</option>
            <option value="az">Name A → Z</option>
            <option value="za">Name Z → A</option>
            <option value="roll-asc">Roll No ↑</option>
            <option value="roll-desc">Roll No ↓</option>
          </select>
        </section>

        {/* ------------------ CONTENT ------------------ */}
        <div className="f-content">
          {/* STUDENT TABLE */}
          <div className="students-card">
            <h3>Student List</h3>

            {loadingStudents ? (
              <p>Loading students...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Subject</th>
                    {/* <th>Branch</th> */}
                    <th>Status</th>
                    <th>Last Marked</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No students match the filters.
                      </td>
                    </tr>
                  )}
                  {filteredStudents.map((s, i) => (
                    <tr key={s._id ?? i}>
                      <td>{s.name}</td>
                      <td>{s.roll || "—"}</td>
                      <td>{s.subject || "—"}</td>
                      {/* <td>{s.branch || "Unassigned"}</td> */}
                      <td className={String(s.status || "").toLowerCase()}>
                        {s.status || "Not Marked"}
                      </td>
                      <td>
                        {s.lastMarkedOn
                          ? new Date(s.lastMarkedOn).toLocaleString()
                          : "—"}
                      </td>

 {/* <button className="btn small ghost" onClick={() => removeStudent(s._id)}>
                              Remove
                            </button> */}
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="students-card">
            <h3>Today's Attendance</h3>
            {todayAttendance.length === 0 ? (
              <p>No records yet today.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Marked At</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendance.slice(0, 10).map((row, idx) => (
                    <tr key={row.attendanceId || row._id || idx}>
                      <td>{row.name}</td>
                      <td>{row.roll}</td>
                      <td>{row.subject}</td>
                      <td className={String(row.status || "").toLowerCase()}>
                        {row.status}
                      </td>
                      <td>
                        {row.markedAt
                          ? new Date(row.markedAt).toLocaleTimeString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* LIVE NOTIFICATIONS SECTION */}
          <div className="notif-card">
            <h3>Live Notifications</h3>

            {notifications.length > 0 ? (
              notifications.slice(0, 6).map((n) => (
                <p key={n._id ?? n.id}>{n.message}</p>
              ))
            ) : (
              <p>No notifications yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

