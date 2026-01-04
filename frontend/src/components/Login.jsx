import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";


function Login() {
  const API_BASE = import.meta.env.VITE_API_URL;
  const initialForm = {
    email: "",
    password: "",
    role: "Student",
    rollNo: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...initialForm, role });
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(`${API_BASE}/api/auth/login`, {
      email: formData.email,
      password: formData.password,
      role: formData.role,
      rollNumber: formData.rollNo,
    });

    setMessage("Login successful!");

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data.userId);
    localStorage.setItem("role", res.data.role.toLowerCase());

    localStorage.removeItem("adminName");
    localStorage.removeItem("facultyName");
    localStorage.removeItem("studentName");

    if (res.data.role === "Admin") {
      localStorage.setItem("adminName", res.data.fullName);
      localStorage.setItem("adminId", res.data.userId);
      navigate("/admin/dashboard");
    }

    if (res.data.role === "Faculty") {
      localStorage.setItem("facultyName", res.data.fullName);
      localStorage.setItem("facultyId", res.data.userId);
      navigate("/faculty/dashboard");
    }

    if (res.data.role === "Student") {
      localStorage.setItem("studentName", res.data.fullName);
      localStorage.setItem("studentId", res.data.userId);
      navigate("/student-dashboard");
    }

    window.dispatchEvent(new Event("authChanged"));

  } catch (error) {
    setMessage(error.response?.data?.error || "Invalid credentials");
  }
};


  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="email"
            name="email"
            placeholder="Enter Email Id"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="role-selector">
            {["Student", "Faculty", "Admin"].map((role) => (
              <button
                key={role}
                type="button"
                className={formData.role === role ? "active" : ""}
                onClick={() => handleRoleChange(role)}
              >
                {role}
              </button>
            ))}
          </div>


          {formData.role === "Student" && (
            <input
              type="text"
              name="rollNo"
              placeholder="Roll No"
              value={formData.rollNo}
              onChange={handleChange}
              required
            />
          )}

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        {message && <p className="msg">{message}</p>}

        <p className="register-text">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="register-link"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
