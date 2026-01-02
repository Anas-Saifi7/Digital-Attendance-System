import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "../Style/Notifications.css";
const API_BASE = import.meta.env.VITE_API_URL;

const socket = io(API_BASE, {
  transports: ["websocket", "polling"],
});


const Notifications = () => {
  const [notifications, setNotifications] = useState([]);



  const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem("token");

 const res = await axios.get(
  `${API_BASE}/api/notifications/student`,
  { headers: { Authorization: `Bearer ${token}` } }
);


    setNotifications(res.data);
  } catch (err) {
    console.log("Error fetching notifications:", err);
  }
};

useEffect(() => {
  fetchNotifications();
}, []);


  // ---------------------------
  // 2) REAL-TIME SOCKET LISTENER
  // ---------------------------
  useEffect(() => {
    const studentId = localStorage.getItem("studentId"); // jab login me save kara tha

    if (studentId) socket.emit("join_student", studentId);

    socket.on("new_notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  // ---------------------------
  // 3) MARK READ
  // ---------------------------
 
const markRead = async (id) => {
  try {
    const token = localStorage.getItem("token");

  await axios.put(
  `${API_BASE}/api/notifications/student/${id}/read`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);


    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, unread: false } : n
      )
    );
  } catch (err) {
    console.log("Error marking read:", err);
  }
};

  // ---------------------------
  // 4) DELETE NOTIFICATION
  // ---------------------------
const removeNotif = async (id) => {
  try {
    const token = localStorage.getItem("token");

  await axios.delete(
  `${API_BASE}/api/notifications/student/${id}`,
  { headers: { Authorization: `Bearer ${token}` } }
);


    setNotifications((prev) =>
      prev.filter((n) => n._id !== id)
    );
  } catch (err) {
    console.log("Error deleting notification:", err);
  }
};



  // ---------------------------
  // 5) CLEAR ALL
  // ---------------------------
const clearAll = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found");
      return;
    }

await axios.delete(
  `${API_BASE}/api/notifications/student/all`,
  { headers: { Authorization: `Bearer ${token}` } }
);


    // Clear UI list
    setNotifications([]);

  } catch (err) {
    console.error("Clear all error:", err);
    alert("Failed to clear notifications");
  }
};

//add
const markAllRead = async () => {
  try {
    const token = localStorage.getItem("token");

   await axios.put(
  `${API_BASE}/api/notifications/student/read-all`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);


    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  } catch (err) {
    console.log("Mark all read error:", err);
  }
};




  return (
    <div className="nt-wrapper">
      <div className="nt-head">
        <h2>Notifications</h2>

        <div className="nt-top-btns">
        
          <button onClick={markAllRead}>Mark All Read</button>


          <button className="clear" onClick={clearAll}>
            Clear All
          </button>
        </div>
      </div>

      {notifications.length === 0 && (
        <p className="nt-empty">No notifications available.</p>
      )}

      <div className="nt-list">
        {notifications.map((n) => (
          <div className={`nt-card ${n.type}`} key={n._id}>
            <div className="nt-left">
              <span className={`dot ${n.type}`}></span>
            </div>

            <div className="nt-body">
              <p className="nt-text">{n.message}</p>

              <div className="nt-bottom">
                <span className="time">{n.time}</span>

                <div className="nt-actions">
                  {n.unread && (
                    <button onClick={() => markRead(n._id)}>Mark Read</button>
                  )}

                  <button
                    className="delete"
                    onClick={() => removeNotif(n._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
