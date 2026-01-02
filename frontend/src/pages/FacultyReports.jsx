const API_BASE = import.meta.env.VITE_API_URL;

import React, { useState, useEffect, useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import axios from "axios";
import "../Style/facultyreports.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const initialHistory = [];

export default function FacultyReports() {
  const [range, setRange] = useState("Monthly");
  const [branch, setBranch] = useState("All");
  const [subject, setSubject] = useState("All");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState(initialHistory);

  const [studentsData, setStudentsData] = useState([]);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch, subject]);

  const loadReport = async () => {
    try {
      const token = localStorage.getItem("token");
   const res = await axios.get(
  `${API_BASE}/api/faculty/reports?branch=${branch === "All" ? "" : branch}&subject=${subject === "All" ? "" : subject}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

      setStudentsData(res.data || []);
    } catch (err) {
      console.error("Load report error:", err);
      setStudentsData([]);
    }
  };

  // Filter logic (client-side search)
  const filtered = useMemo(() => {
    return studentsData.filter((s) => {
      if (branch !== "All" && s.branch !== branch) return false;
      if (subject !== "All" && s.subject !== subject) return false;
      if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [studentsData, branch, subject, query]);

  // Summary
  const summary = useMemo(() => {
    const total = filtered.length;
    const good = filtered.filter((s) => s.attendance >= 80).length;
    const avg = filtered.filter((s) => s.attendance >= 60 && s.attendance < 80).length;
    const low = filtered.filter((s) => s.attendance < 60).length;
    const percent = total ? Math.round(filtered.reduce((a, b) => a + (b.attendance || 0), 0) / total) : 0;
    return { total, good, avg, low, percent };
  }, [filtered]);

  // Charts
  const barData = {
    labels: filtered.map((s) => s.name),
    datasets: [
      {
        label: "Attendance %",
        data: filtered.map((s) => s.attendance),
        backgroundColor: "rgba(29,78,216,0.7)",
      },
    ],
  };

  const pieData = {
    labels: ["Good (80%+)", "Average (60-79%)", "Low (<60%)"],
    datasets: [
      {
        data: [summary.good, summary.avg, summary.low],
        backgroundColor: ["#16a34a", "#fbbf24", "#dc2626"],
      },
    ],
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Report", 10, 10);
    filtered.forEach((s, i) => {
      doc.text(`${i + 1}. ${s.name} - ${s.attendance}%`, 10, 20 + i * 10);
    });
    doc.save("Attendance_Report.pdf");
    addHistory("PDF");
  };

  // CSV Export
  const exportCSV = () => {
    let csv = "Name,Branch,Subject,Attendance%\n";
    filtered.forEach((s) => (csv += `${s.name},${s.branch},${s.subject},${s.attendance}\n`));
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "Attendance_Report.csv");
    addHistory("CSV");
  };

  // Add to history
  const addHistory = (format) => {
    const entry = {
      id: history.length + 1,
      date: new Date().toISOString().split("T")[0],
      type: `${range} Report`,
      branch,
      format,
    };
    setHistory((h) => [entry, ...h]);
  };

  return (
    <div className="reports-page">
      <h2>Attendance Reports</h2>

      {/* Filters */}
      <div className="filters">
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>

        <select value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="All">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="ME">ME</option>
        </select>

        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="All">All Subjects</option>
          <option value="DS">DS</option>
          <option value="DBMS">DBMS</option>
          <option value="OS">OS</option>
          <option value="Thermo">Thermo</option>
        </select>

        <input type="text" placeholder="Search Student..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {/* Summary Cards */}
      <div className="summary">
        <div className="card">Total Students: {summary.total}</div>
        <div className="card green">Good: {summary.good}</div>
        <div className="card yellow">Average: {summary.avg}</div>
        <div className="card red">Low: {summary.low}</div>
        <div className="card blue">Avg Attendance: {summary.percent}%</div>
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="chart-box">
          <Bar data={barData} />
        </div>
        <div className="chart-box">
          <Pie data={pieData} />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="export-btns">
        <button onClick={exportPDF}>Download PDF</button>
        <button onClick={exportCSV}>Download CSV</button>
      </div>

      {/* Report History */}
      <h3 className="history-title">Sent Report History</h3>
      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Report Type</th>
            <th>Branch</th>
            <th>Format</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td>{h.date}</td>
              <td>{h.type}</td>
              <td>{h.branch}</td>
              <td>{h.format}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
