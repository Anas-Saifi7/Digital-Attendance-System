
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";


function Register() {
  
  const initialForm = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    rollNumber: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData({ ...initialForm, role });
  };

const API_BASE = import.meta.env.VITE_API_URL;

const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    setMessage("Passwords do not match!");
    return;
  }

  try {
    const payload = {
      ...formData,
      rollNumber: formData.rollNumber,
    };

    const res = await axios.post(
      `${API_BASE}/api/auth/register`,
      payload
    );

    setMessage(res.data.message || "Registration successful!");
    setTimeout(() => navigate("/login"), 1500);

  } catch (error) {
    if (error.response) {
      setMessage(
        error.response.data?.error ||
        error.response.data?.message ||
        "Something went wrong"
      );
    } else {
      setMessage("Cannot connect to server");
    }
  }
};


  return (
    <div className="register-page">
      <div className="register-box">
        <h2>User Registration</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
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
              name="rollNumber" 
              placeholder="Roll No"
              value={formData.rollNumber || ""} 
              onChange={handleChange}
              required
            />
          )}

          <button type="submit" className="register-btn">
            Register
          </button>
        </form>

        {message && <p className="msg">{message}</p>}

        <p className="login-text">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="login-link"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
