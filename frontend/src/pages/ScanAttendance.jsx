import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

export default function ScanAttendance() {
  const scannerRef = useRef(null);
  const [status, setStatus] = useState("Waiting for scan...");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const cleanQR = (txt) =>
    txt?.trim().replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "") || "";

  // 🔥 Start Scanner
  const startScanner = () => {
    const scanner = new Html5Qrcode("qrScannerBox");

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        onScanSuccess
      )
      .then(() => {
        console.log("Scanner Started");
        setStatus("📸 Scan the QR Code");
        setScanning(true);
      })
      .catch((err) => {
        console.log("Scanner Error:", err);
        setStatus("❌ Unable to start scanner");
      });

    scannerRef.current = scanner;
  };

const stopScanner = async () => {
  if (scannerRef.current) {
    try {
      await scannerRef.current.stop();
      await scannerRef.current.clear(); // 🔥 VERY IMPORTANT
      scannerRef.current = null;
      console.log("Scanner Stopped & Cleared");
    } catch (err) {
      console.log("Stop error:", err);
    }
  }
  setScanning(false);
};

  // 📌 On Successful QR Scan
  const onScanSuccess = async (decodedText) => {
      // if (loading || scanning === false) return;
    console.log("RAW QR:", decodedText);

    if (loading) return;
    setLoading(true);
    setStatus("Processing QR...");

    await stopScanner(); // Stop scanning immediately

    try {
      const clean = cleanQR(decodedText);
      let payload;

      try {
        payload = JSON.parse(clean);
      } catch {
        setStatus("❌ Invalid QR Format");
        setLoading(false);
        return;
      }

      if (!payload.sessionId || !payload.qrToken) {
        setStatus("❌ Invalid QR Data");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const studentId = localStorage.getItem("userId");

      if (!token) {
        setStatus("❌ Login Required");
        setLoading(false);
        return;
      }

      if (!studentId) {
        setStatus("❌ Student ID missing — Login again");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/attendance/mark",
        {
          // studentId,
          sessionId: payload.sessionId,
          qrToken: payload.qrToken,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStatus("✅ " + res.data.message);
setScanning(false);
      const role = localStorage.getItem("role");
      if (role === "Student") {
        setTimeout(() => navigate("/student-dashboard"), 1500);
      }
    } catch (err) {
      console.log("SERVER ERROR FULL:", err.response?.data);

      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Server Error";

      setStatus("❌ " + msg);
    }
  setScanning(false);
    setLoading(false);
  };

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Scan Attendance QR</h2>

      <div
        id="qrScannerBox"
        style={{
          width: 320,
          height: 320,
          border: "2px solid #ccc",
          borderRadius: 10,
        }}
      />

      <p style={{ marginTop: 20, fontWeight: "bold" }}>{status}</p>

      {/* 🔄 Rescan Button */}
      {!scanning && (
        <button
          onClick={startScanner}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#4A90E2",
            color: "white",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          🔄 Scan Again
        </button>
      )}
    </div>
  );
}
