import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Style/studentPage.css";
import { useNavigate } from "react-router-dom";

const FacultyStudents = () => {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState([]);
  const [query, setQuery] = useState("");

  const [editId, setEditId] = useState(null);
const [editData, setEditData] = useState({});

  // 🔑 ROLE (admin | faculty | student)
  const role = localStorage.getItem("role");

  useEffect(() => {
    loadStudents();
  }, []);

  // ✅ KEEP WORKING API
  const loadStudents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/faculty/students",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStudentData(res.data);
    } catch (err) {
      console.log("Fetch students error:", err);
    }
  };

  // ❌ DELETE STUDENT (ADMIN + FACULTY ONLY)
  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/admin/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // remove from UI
      setStudentData(studentData.filter((s) => s._id !== id));
    } catch (err) {
      console.log("Delete student error:", err);
      alert("Delete failed");
    }
  };

  const updateStudent = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/students/${id}`,
      editData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setEditId(null);
    loadStudents(); // refresh data
  } catch (err) {
    console.log("Update error:", err);
    alert("Update failed");
  }
};


  const filtered = studentData.filter(
    (student) =>
      student.name?.toLowerCase().includes(query.toLowerCase()) ||
      student.roll?.toString().includes(query)
  );

  return (
    <div className="students-page">
      <div className="sp-header">
        <h2>All Students</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="Search Name or Roll No..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="students-grid">
        {filtered.map((s) => (
          <div className="student-card" key={s._id}>
            <div className="top-row">
           {editId === s._id ? (
  <input
    value={editData.name}
    onChange={(e) =>
      setEditData({ ...editData, name: e.target.value })
    }
  />
) : (
  <h3>{s.name}</h3>
)}

              <span className="badge status-present">Active</span>
            </div>

            <p><strong>Roll No:</strong> {s.roll}</p>
            <p><strong>Branch:</strong> {s.branch}</p>
            <p><strong>Subject:</strong> {s.subject}</p>

            <div className="divider"></div>

            <p><strong>Address:</strong> {s.address || "N/A"}</p>

            <div className="divider"></div>

            <p><strong>Email:</strong> {s.email}</p>
            <p><strong>Contact:</strong> {s.phone || "N/A"}</p>

            <div className="action-row">
              <button
                className="view-more"
                onClick={() =>
                  navigate("/student/profile", { state: { student: s } })
                }
              >
                View Full Profile
              </button>

              {/* ✏️ EDIT (ADMIN + FACULTY) */}
          {(role === "admin" || role === "faculty") && (
  <button
    className="edit-btn"
    onClick={() => {
      setEditId(s._id);
      setEditData(s);
    }}
  >
    Edit
  </button>
)}


              {/* 🗑️ DELETE (ADMIN + FACULTY) */}
              {(role === "admin" || role === "faculty") && (
                <button
                  className="delete-btn"
                  onClick={() => deleteStudent(s._id)}
                >
                  Delete
                </button>
              )}

              {editId === s._id && (
  <button
    className="save-btn"
    onClick={() => updateStudent(s._id)}
  >
    Save
  </button>
)}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultyStudents;
