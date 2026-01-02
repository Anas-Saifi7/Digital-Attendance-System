import React from "react";
import hero from "../assets/hero.jpg";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <main>
      {/* HERO SECTION */}
      <section className="hero">
        <img src={hero} alt="Hero Banner" className="hero-image" />

        <div className="hero-overlay">
          <div className="hero-content container">

            <h1 className="hero-title">
              Smart Digital<br />Attendance System
            </h1>

            <p className="hero-sub">
              Efficient, secure, and seamless attendance management using
              QR Code Technology.
            </p>

            <div className="hero-cta">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/signup" className="btn btn-white">Signup</Link>
            </div>


          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about container" id="about">
        <h2>About Our System</h2>

        <div className="about-grid">
          <p>
            Our Smart Attendance System is designed to provide a secure,
            automated, and efficient solution for managing student attendance
            using QR Codes. Admin,
            faculty & students can access real-time dashboards and reports.
          </p>

          <ul className="features">
            <li><strong>Automatic marking:</strong> QR/RFID</li>
            <li><strong>Reports:</strong> Daily & Monthly export (CSV/PDF)</li>
            <li><strong>Role-based:</strong> Student / Faculty / Admin dashboards</li>
          </ul>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
