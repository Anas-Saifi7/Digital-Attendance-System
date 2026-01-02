import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiTag,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import "../Style/teacher.css";

export default function TeacherDetails() {
  const [teachers, setTeachers] = useState([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState({ key: "name", dir: "asc" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gender: "Male",
    subject: "",
    qualification: "",
    experience: "",
    joiningDate: "",
  });

  /* ---------------- BACKEND FETCH ------------------ */
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data);
    } catch (err) {
      console.error("Fetch teachers error", err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  /* ---------------- ADD / UPDATE ------------------ */
  const submitForm = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      if (editing) {
        await axios.put(
          `http://localhost:5000/api/admin/teachers/${editing._id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`http://localhost:5000/api/admin/teachers`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowForm(false);
      setEditing(null);
      fetchTeachers();
    } catch (err) {
      console.error("Save teacher error", err);
      alert("Error saving teacher");
    }
  };

  /* ---------------- DELETE ------------------ */
  const deleteTeacher = async (id) => {
    if (!window.confirm("Delete teacher?")) return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:5000/api/admin/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- SORT + SEARCH ------------------ */
  const processed = useMemo(() => {
    let out = [...teachers];
    const q = query.toLowerCase();

    if (q) {
      out = out.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.phone?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q)
      );
    }

    const { key, dir } = sortBy;
    out.sort((a, b) => {
      const va = (a[key] || "").toString().toLowerCase();
      const vb = (b[key] || "").toString().toLowerCase();
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });

    return out;
  }, [teachers, query, sortBy]);

  /* ---------------- UI HELPERS ------------------ */
  function SortIcon({ keyName }) {
    if (sortBy.key !== keyName) return <FiChevronDown className="muted" />;
    return sortBy.dir === "asc" ? <FiChevronUp /> : <FiChevronDown />;
  }

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      gender: "Male",
      subject: "",
      qualification: "",
      experience: "",
      joiningDate: "",
    });
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm(t);
    setShowForm(true);
  };

  /* ---------------- UI ------------------ */

  return (
    <div className="teacher-cards-root">
      <div className="top-row">
        <div className="left">
          <h2 className="page-title">
            <FiUser className="page-icon" /> Teacher Management
          </h2>
          <div className="subtitle muted">Add, edit, remove teachers</div>
        </div>

        <div className="right-controls">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, subject, email..."
            />
          </div>

          <button className="btn primary" onClick={openAdd}>
            <FiPlus /> Add Teacher
          </button>
        </div>
      </div>

      {/* grid */}
      <div className="cards-grid">
        {processed.map((t) => (
          <div className="teacher-card" key={t._id}>
            <div className="card-header">
              <div className="name-block">
                <div className="name">{t.name}</div>
                <div className="subject-tag">
                  <FiTag /> {t.subject || "-"}
                </div>
              </div>

              <div className="card-actions">
                <button className="icon-btn" onClick={() => openEdit(t)}>
                  <FiEdit2 />
                </button>
                <button className="icon-btn danger" onClick={() => deleteTeacher(t._id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className="card-body">
              <div className="row">
                <FiUser className="muted-icon" /> <strong>Qualification:</strong>{" "}
                <span>{t.qualification || "-"}</span>
              </div>
              <div className="row">
                <FiPhone className="muted-icon" /> <strong>Phone:</strong>{" "}
                <span>{t.phone || "-"}</span>
              </div>
              <div className="row">
                <FiMail className="muted-icon" /> <strong>Email:</strong>{" "}
                <span>{t.email || "-"}</span>
              </div>
              <div className="row">
                <FiMapPin className="muted-icon" /> <strong>Address:</strong>{" "}
                <span>{t.address || "-"}</span>
              </div>
            </div>

            <div className="card-footer">
              <div className="meta">
                <span className="exp">{t.experience || "-"}</span>
                <span className="join">
                  Joined:{" "}
                  {t.joiningDate
                    ? new Date(t.joiningDate).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {processed.length === 0 && (
          <div className="no-results card">
            <p>No teachers found.</p>
          </div>
        )}
      </div>

      {/* modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? "Edit Teacher" : "Add Teacher"}</h3>
              <button className="btn small ghost" onClick={() => setShowForm(false)}>
                Close
              </button>
            </div>

            <form className="modal-body" onSubmit={submitForm}>
              <div className="form-grid">

                {/* FULL OLD FORM FIELDS */}
                <label>
                  Name <span className="required">*</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>

                <label>
                  Phone
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>

                <label>
                  Email
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>

                <label>
                  Subject
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </label>

                <label>
                  Qualification
                  <input
                    value={form.qualification}
                    onChange={(e) =>
                      setForm({ ...form, qualification: e.target.value })
                    }
                  />
                </label>

                <label>
                  Experience
                  <input
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                  />
                </label>

                <label>
                  Joining Date
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) =>
                      setForm({ ...form, joiningDate: e.target.value })
                    }
                  />
                </label>

                <label className="full-width">
                  Address
                  <input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </label>

                <label>
                  Gender
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button className="btn primary" type="submit">
                  {editing ? "Save" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
