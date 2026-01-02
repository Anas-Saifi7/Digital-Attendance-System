import axios from "axios";

// backend ka URL port 5000
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getStudentDashboard = async (studentId) => {
  const res = await axios.get(`${API_BASE}/api/students/${studentId}/dashboard`);
  return res.data;
};
