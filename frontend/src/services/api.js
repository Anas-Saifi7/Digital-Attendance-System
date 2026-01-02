import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getStudentDashboard = async (studentId) => {
  const res = await axios.get(`${API_BASE}/students/${studentId}/dashboard`);
  return res.data;
};
