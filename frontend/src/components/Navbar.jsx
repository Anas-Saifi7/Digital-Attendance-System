import React, { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";

const getAuthInfo = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return {
    role: user?.role,
    fullName: user?.fullName,
  };
};

const Navbar = () => {
  const navigate = useNavigate();
  const [authInfo, setAuthInfo] = useState(getAuthInfo());

  const token = localStorage.getItem("token"); // ✅ DEFINE TOKEN HERE
  const isLoggedIn = Boolean(token);            // ✅ SAFE CHECK

  useEffect(() => {
    const handleAuthChange = () => setAuthInfo(getAuthInfo());
    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="brand">
          <img src={logo} alt="logo" className="logo-img" />
          <span>Dr. A.P.J. Abdul Kalam Technical University</span>
        </div>

        {isLoggedIn && (
          <div className="nav-session">
            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
