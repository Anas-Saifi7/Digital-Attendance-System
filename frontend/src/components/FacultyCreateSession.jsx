import React, { useState } from "react";
import axios from "axios";


export default function FacultyCreateSession() {
  const API_BASE = import.meta.env.VITE_API_URL;
  const [form, setForm] = useState({
    subject: "",
    classRoom: "",
    startTime: "",
    endTime: "",
  });

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // CREATE SESSION
  const createSession = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

 const res = await axios.post(
  `${API_BASE}/api/attendance/create-session`,
  form,
  { headers: { Authorization: `Bearer ${token}` } }
);



      console.log("BACKEND RESPONSE →", res.data);
      setSession(res.data);
    } catch (error) {
      console.log("CREATE SESSION ERROR:", error);
      setErr(error.response?.data?.error || "Server error");
    }

    setLoading(false);
  };

  // GENERATE QR URL
  const getQrUrl = () => {
    if (!session) return "";

    const payload = {
      sessionId: session.sessionId,
      qrToken: session.qrToken,
    };

    console.log("QR PAYLOAD →", payload);

    return (
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
      encodeURIComponent(JSON.stringify(payload))
    );
  };

  return (
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <h2>Create Session & Generate QR</h2>

      <form onSubmit={createSession} style={{ display: "grid", gap: 8 }}>
        <input
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          required
        />

        <input
          name="classRoom"
          placeholder="Classroom"
          value={form.classRoom}
          onChange={handleChange}
        />

        <label>
          Start Time:
          <input
            name="startTime"
            type="datetime-local"
            value={form.startTime}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          End Time:
          <input
            name="endTime"
            type="datetime-local"
            value={form.endTime}
            onChange={handleChange}
            required
          />
        </label>

        <button className="btn primary" disabled={loading}>
          {loading ? "Creating..." : "Create Session"}
        </button>

        {err && <p style={{ color: "red" }}>{err}</p>}
      </form>

      {session && (
        <div style={{ marginTop: 20 }}>
          <h3>QR Generated</h3>

          <img
            src={getQrUrl()}
            alt="QR"
            style={{ width: 280, height: 280, border: "1px solid #ddd" }}
          />

          <h4>Raw Payload:</h4>
          <pre>
            {JSON.stringify(
              { sessionId: session.sessionId, qrToken: session.qrToken },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
