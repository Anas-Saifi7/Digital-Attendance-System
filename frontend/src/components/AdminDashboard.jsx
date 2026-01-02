import { Link, useLocation } from "react-router-dom";
import React, { useMemo, useState, useEffect } from "react";
import "../Style/adminD.css";
import axios from "axios";


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";
import {
  FiHome,
  FiUsers,
  FiBook,
  FiMenu,
  FiSearch,
  FiUserCheck,
  FiX,
  FiBarChart2,
} from "react-icons/fi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const API_BASE = import.meta.env.VITE_API_URL;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminName = localStorage.getItem("adminName");

  const [attendance, setAttendance] = useState([]); // <-- NEW
  const [query, setQuery] = useState("");

  const location = useLocation();
  const [width, setWidth] = useState(window.innerWidth);

  // const adminName = localStorage.getItem("fullName");

  // Responsive
  useEffect(() => {
    const resize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (width <= 880) setCollapsed(false);
  }, [width]);

  // FETCH ATTENDANCE FOR ADMIN
  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");

     const res = await axios.get(
  `${API_BASE}/api/attendance/all`,
  { headers: { Authorization: `Bearer ${token}` } }
);


      setAttendance(res.data || []);
    } catch (err) {
      console.error("Admin attendance fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // STATS (from attendance table)
  const stats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter((x) => x.status === "Present").length;
    const absent = attendance.filter((x) => x.status === "Absent").length;
    const late = attendance.filter((x) => x.status === "Late").length;

    return {
      total,
      present,
      absent,
      late,
      overallPct: total ? Math.round((present / total) * 100) : 0,
    };
  }, [attendance]);

  // SEARCH
  const filtered = attendance.filter((a) =>
    `${a.studentId?.fullName} ${a.studentId?.roll} ${a.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const handleHeaderToggle = () => {
    if (width <= 880) setMobileOpen((x) => !x);
    else setCollapsed((x) => !x);
  };

  return (
    <div className={`dashboard-root ${collapsed ? "collapsed" : ""}`}>
      <div className="app-body">

        {/* SIDEBAR */}
        <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
          <div className="brand-row">
            {!collapsed && <div className="brand-name">{adminName || "ADMIN"}</div>
            }
            <button className="mobile-close" onClick={() => setMobileOpen(false)}>
              <FiX />
            </button>
          </div>

          <nav className="nav-list">
      <Link to="/admin/dashboard" className={location.pathname === "/admin/dashboard" ? "active nav-link" : "nav-link"}>
  <FiHome /> {!collapsed && "Dashboard"}
</Link>

<Link to="/admin/students" className={location.pathname === "/admin/students" ? "active nav-link" : "nav-link"}>
  <FiUsers /> {!collapsed && "Students"}
</Link>

<Link to="/admin/teachers" className={location.pathname === "/admin/teachers" ? "active nav-link" : "nav-link"}>
  <FiUserCheck /> {!collapsed && "Teachers"}
</Link>

<Link to="/admin/attendance" className={location.pathname === "/admin/attendance" ? "active nav-link" : "nav-link"}>
  <FiBarChart2 /> {!collapsed && "Attendance"}
</Link>

<Link to="/admin/subjects" className={location.pathname === "/admin/subjects" ? "active nav-link" : "nav-link"}>
  <FiBook /> {!collapsed && "Subjects"}
</Link>

          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="main-column">

          {/* TOPBAR */}
          <header className="topbar header-toggle">
            <button className="icon-btn" onClick={handleHeaderToggle}>
              <FiMenu />
            </button>

            <h1 className="title">Admin Dashboard</h1>

            <div className="global-search">
              <div className="search-inner">
                <FiSearch className="search-icon" />
                <input
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <main className="content">

            {/* STATS */}
            <section className="top-cards">
              <div className="card overview-card">
                <div className="card-header">
                  <h3>Attendance Overview</h3>
                  <div>Total Entries: {stats.total}</div>
                </div>

                <div className="overview-body">
                  <div className="chart-left">
                    <Bar
                      data={{
                        labels: ["Total", "Present", "Absent", "Late"],
                        datasets: [
                          {
                            data: [
                              stats.total,
                              stats.present,
                              stats.absent,
                              stats.late,
                            ],
                            backgroundColor: [
                              "#9fc6ff",
                              "#2f80ed",
                              "#f87171",
                              "#ffcc80",
                            ],
                            borderRadius: 6,
                          },
                        ],
                      }}
                      options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }}


                    />
                  </div>

                  <div className="chart-right">
                    <Doughnut
                      data={{
                        labels: ["Present", "Absent", "Late"],
                        datasets: [
                          {
                            data: [stats.present, stats.absent, stats.late],
                            backgroundColor: ["#2f80ed", "#f87171", "#ffcc80"],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false
                      }}

                    />
                  </div>
                </div>
              </div>
            </section>

            {/* TABLE */}
            <section className="bottom-section">
              <div className="card table-card">
                <div className="table-head">
                  <h3>Attendance Records</h3>
                </div>

                <div className="table-wrap">
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Roll</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map((a) => (
                        <tr key={a._id}>
                          <td>{a.studentId?.fullName}</td>
                          <td>{a.studentId?.rollNumber}</td>
                          <td>{a.subject}</td>
                          <td>{a.status}</td>
                          {/* <td>{a.date}</td> */}
                            <td>{new Date(a.date).toLocaleDateString()}</td>
                        </tr>
                      ))}

                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            No attendance records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

