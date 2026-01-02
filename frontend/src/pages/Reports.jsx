import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import axios from "axios";
import "../Style/reports.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function ReportsV5() {
  // ---------- REAL BACKEND DATA ----------
  const [data, setData] = useState([]);
  const [subject, setSubject] = useState("All");
  const [month, setMonth] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dark, setDark] = useState(false);
  const chartRef = useRef(null);

  // add An




  // ---------- FETCH FROM BACKEND ----------
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/student/attendance", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data);
      } catch (err) {
        console.log("Error loading data:", err);
      }
    };

    loadAttendance();
  }, []);

  // ---------- DYNAMIC SUBJECT LIST ----------
  const subjects = useMemo(() => {
    return [...new Set(data.map((item) => item.subject))];
  }, [data]);

  // ---------- FILTER LOGIC ----------
  const filtered = useMemo(() => {
    let list = [...data];

    if (subject !== "All") list = list.filter((r) => r.subject === subject);
    if (month) list = list.filter((r) => r.date.slice(0, 7) === month);
    if (from) list = list.filter((r) => r.date >= from);
    if (to) list = list.filter((r) => r.date <= to);

    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.subject.toLowerCase().includes(qq) ||
          r.date.includes(qq) ||
          r.status.toLowerCase().includes(qq)
      );
    }

    return list;
  }, [data, subject, month, from, to, q]);

  // ---------- SUMMARY ----------
  const summary = useMemo(() => {
    const total = filtered.length;
    const present = filtered.filter((r) => r.status === "Present").length;
    const absent = filtered.filter((r) => r.status === "Absent").length;
    const late = filtered.filter((r) => r.status === "Late").length;

    return {
      total,
      present,
      absent,
      late,
      presentPct: total ? ((present / total) * 100).toFixed(1) : "0.0",
      absentPct: total ? ((absent / total) * 100).toFixed(1) : "0.0",
      latePct: total ? ((late / total) * 100).toFixed(1) : "0.0",
    };
  }, [filtered]);

  // ---------- HEATMAP ----------
  const heatmap = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      if (!map[r.date]) map[r.date] = { present: 0, absent: 0, late: 0 };
      if (r.status === "Present") map[r.date].present++;
      if (r.status === "Absent") map[r.date].absent++;
      if (r.status === "Late") map[r.date].late++;
    });

    return Object.keys(map)
      .sort()
      .map((d) => ({ date: d, ...map[d] }));
  }, [filtered]);

  // ---------- CHARTS ----------
  const lineData = useMemo(() => {
    const byDate = {};
    filtered.forEach((r) => {
      if (!byDate[r.date]) byDate[r.date] = { present: 0, total: 0 };
      byDate[r.date].total++;
      if (r.status === "Present") byDate[r.date].present++;
    });

    const labels = Object.keys(byDate).sort();
    const perc = labels.map((d) =>
      Math.round((byDate[d].present / Math.max(1, byDate[d].total)) * 100)
    );

    return {
      labels,
      datasets: [
        {
          label: "Attendance %",
          data: perc,
          borderColor: "#0b84ff",
          backgroundColor: "rgba(11,132,255,0.12)",
          tension: 0.25,
          pointRadius: 2,
        },
      ],
    };
  }, [filtered]);

  const barData = useMemo(() => {
    const bySub = {};
    filtered.forEach((r) => {
      if (!bySub[r.subject]) bySub[r.subject] = { present: 0, total: 0 };
      bySub[r.subject].total++;
      if (r.status === "Present") bySub[r.subject].present++;
    });

    const labels = Object.keys(bySub);
    const perc = labels.map((s) =>
      Math.round((bySub[s].present / Math.max(1, bySub[s].total)) * 100)
    );

    return {
      labels,
      datasets: [
        {
          label: "Subject % (Present)",
          data: perc,
          backgroundColor: "#08b981",
          borderRadius: 6,
        },
      ],
    };
  }, [filtered]);

  // ---------- EXPORTS ----------
  const exportPDF = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.setFontSize(16);
    doc.text("Attendance Report", 40, 40);

    doc.autoTable({
      head: [["Date", "Subject", "Status"]],
      body: filtered.map((r) => [r.date, r.subject, r.status]),
      startY: 70,
    });

    doc.save("Attendance_Report.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "Attendance_Report.xlsx");
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Attendance_Report.csv";
    a.click();
  };

  return (
    <div className={`rv5-root ${dark ? "rv5-dark" : ""}`}>

      {/* HEADER */}
      <header className="rv5-header">
        <div className="rv5-left">
          <button className="rv5-btn-ghost" onClick={() => setShowFilters(true)}>
            ☰
          </button>
          <div className="rv5-title">
            <div className="rv5-subtitle">Attendance</div>
            <div className="rv5-main-title">Reports</div>
          </div>
        </div>

        <div className="rv5-right">
          <button className="rv5-icon" onClick={() => setDark((d) => !d)}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* SUMMARY CARDS */}
      <section className="rv5-swipe">
        <div className="rv5-swipe-track">
          <div className="rv5-card small">
            <div className="rv5-card-label">Present</div>
            <div className="rv5-card-value">{summary.presentPct}%</div>
          </div>
          <div className="rv5-card small danger">
            <div className="rv5-card-label">Absent</div>
            <div className="rv5-card-value">{summary.absentPct}%</div>
          </div>
          <div className="rv5-card small warn">
            <div className="rv5-card-label">Late</div>
            <div className="rv5-card-value">{summary.latePct}%</div>
          </div>
          <div className="rv5-card small">
            <div className="rv5-card-label">Total</div>
            <div className="rv5-card-value">{summary.total}</div>
          </div>
        </div>
      </section>

      {/* CHARTS */}
      <div className="rv5-charts" ref={chartRef}>
        <div className="rv5-panel">
          <h4>Attendance Trend</h4>
          <Line data={lineData} options={{ plugins: { legend: { display: false } } }} />
        </div>

        <div className="rv5-panel">
          <h4>By Subject</h4>
          <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
        </div>
      </div>

      {/* LIST */}
      <div className="rv5-list">
        {filtered.map((r, i) => (
          <article key={i} className="rv5-list-card">
            <div className="rv5-list-left">
              <div className="rv5-list-sub">{r.subject}</div>
              <div className="rv5-list-date">{r.date}</div>
            </div>
            <div className={`rv5-pill ${r.status.toLowerCase()}`}>{r.status}</div>
          </article>
        ))}
      </div>

      {/* EXPORT BUTTONS */}
      <div className="rv5-fab-group">
        <button className="rv5-fab rv5-fab-blue" onClick={exportPDF}>PDF</button>
        <button className="rv5-fab rv5-fab-green" onClick={exportExcel}>XLSX</button>
        <button className="rv5-fab rv5-fab-slate" onClick={exportCSV}>CSV</button>
      </div>

      {/* FILTERS PANEL */}
      {showFilters && (
  <div className="rv5-bottomsheet" role="dialog">
    {/* backdrop */}
    <div
      className="rv5-backdrop"
      onClick={() => setShowFilters(false)}
    />
 
    {/* sliding sheet */}
    <div className="rv5-sheet">
      {/* header */}
      <div className="rv5-sheet-head">
        <div className="rv5-sheet-title">Filters</div>
        <button className="rv5-close" onClick={() => setShowFilters(false)}>
          Close
        </button>
      </div>

      {/* body */}
      <div className="rv5-sheet-body">
        <label className="rv5-field">
          Subject
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            {subjects.map((s) => (
              <option value={s} key={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="rv5-field">
          Month
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>

        <div className="rv5-row">
          <label className="rv5-field small">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>

          <label className="rv5-field small">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>

        <label className="rv5-field">
          Search
          <input
            placeholder="date/subject/status"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <div className="rv5-actions-row">
          <button
            className="rv5-btn-outline"
            onClick={() => {
              setSubject("All");
              setMonth("");
              setFrom("");
              setTo("");
              setQ("");
            }}
          >
            Reset
          </button>

          <button
            className="rv5-btn-apply"
            onClick={() => setShowFilters(false)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
}

