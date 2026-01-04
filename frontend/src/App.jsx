
// import React, { useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
// } from "react-router-dom";
// import socket from "./socket";


// import Register from "./components/Register.jsx";
// import Login from "./components/Login.jsx";
// import Navbar from "./components/Navbar.jsx";
// import HomePage from "./components/HomePage.jsx";

// // STUDENT
// import StudentDashboard from "./components/StudentDashboard.jsx";
// import Reports from "./pages/Reports.jsx";
// import Notifications from "./pages/Notifications.jsx";
// import StudentProfile from "./pages/StudentProfile.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.jsx";

// // FACULTY
// import FacultyDashboard from "./components/FacultyDashboard.jsx";
// import StudentsPage from "./pages/FacultyStudents.jsx";
// import FacultyAttendance from "./pages/FacultyAttendance.jsx";
// import FacultyReports from "./pages/FacultyReports.jsx";

// // ADMIN
// import AdminDashboard from "./components/AdminDashboard.jsx";
// import TeacherDetails from "./pages/TeacherDetails.jsx";
// import ScanAttendance from "./pages/ScanAttendance.jsx";
// import FacultyCreateSession from "./components/FacultyCreateSession.jsx";


// function App() {
//   /* 🔥 SOCKET INIT (ROLE BASED) */
//   useEffect(() => {
//     const role = localStorage.getItem("role");
//     const userId = localStorage.getItem("userId");

//     if (!role || !userId) return;

//     if (!socket.connected) socket.connect();

//     socket.emit(`join_${role}`, userId); // join_student | join_faculty | join_admin

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <Router>
//       {/* <Layout> */}
//       <Navbar />
//         <Routes>
//           {/* PUBLIC */}
//           <Route path="/" element={<HomePage />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Register />} />

//           {/* STUDENT */}
//           <Route
//             path="/student/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["student"]}>
//                 <StudentDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/reports"
//             element={
//               <ProtectedRoute allowedRoles={["student"]}>
//                 <Reports />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/notifications"
//             element={
//               <ProtectedRoute allowedRoles={["student"]}>
//                 <Notifications />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/student/profile"
//             element={
//               <ProtectedRoute allowedRoles={["student"]}>
//                 <StudentProfile />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/student/scan"
//             element={
//               <ProtectedRoute allowedRoles={["student"]}>
//                 <ScanAttendance />
//               </ProtectedRoute>
//             }
//           />

//           {/* FACULTY */}
//           <Route
//             path="/faculty/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["faculty"]}>
//                 <FacultyDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/faculty/students"
//             element={
//               <ProtectedRoute allowedRoles={["faculty"]}>
//                 <StudentsPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/faculty/attendance"
//             element={
//               <ProtectedRoute allowedRoles={["faculty"]}>
//                 <FacultyAttendance />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/faculty/reports"
//             element={
//               <ProtectedRoute allowedRoles={["faculty"]}>
//                 <FacultyReports />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/faculty/create-session"
//             element={
//               <ProtectedRoute allowedRoles={["faculty"]}>
//                 <FacultyCreateSession />
//               </ProtectedRoute>
//             }
//           />

//           {/* ADMIN */}
//           <Route
//             path="/admin/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["admin"]}>
//                 <AdminDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/students"
//             element={
//               <ProtectedRoute allowedRoles={["admin"]}>
//                 <StudentsPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/attendance"
//             element={
//               <ProtectedRoute allowedRoles={["admin"]}>
//                 <FacultyAttendance />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin/teachers"
//             element={
//               <ProtectedRoute allowedRoles={["admin"]}>
//                 <TeacherDetails />
//               </ProtectedRoute>
//             }
//           />

//           {/* 🔁 BACKWARD COMPATIBILITY */}
//           <Route path="/student-dashboard" element={<Navigate to="/student/dashboard" replace />} />
//           <Route path="/faculty-dashboard" element={<Navigate to="/faculty/dashboard" replace />} />
//           <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
//         </Routes>
//       {/* </Layout> */}
//     </Router>
//   );
// }

// export default App;


import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import socket from "./socket";

import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./components/HomePage.jsx";

// STUDENT
import StudentDashboard from "./components/StudentDashboard.jsx";
import Reports from "./pages/Reports.jsx";
import Notifications from "./pages/Notifications.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// FACULTY
import FacultyDashboard from "./components/FacultyDashboard.jsx";
import StudentsPage from "./pages/FacultyStudents.jsx";
import FacultyAttendance from "./pages/FacultyAttendance.jsx";
import FacultyReports from "./pages/FacultyReports.jsx";

// ADMIN
import AdminDashboard from "./components/AdminDashboard.jsx";
import TeacherDetails from "./pages/TeacherDetails.jsx";
import ScanAttendance from "./pages/ScanAttendance.jsx";
import FacultyCreateSession from "./components/FacultyCreateSession.jsx";

function App() {
  /* 🔥 SOCKET INIT (ROLE BASED) */
  useEffect(() => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (!role || !userId) return;

    if (!socket.connected) socket.connect();

    socket.emit(`join_${role}`, userId); // join_student | join_faculty | join_admin

    return () => {
      // socket.disconnect();
    };
  }, []);

  return (
    <>
      <Navbar />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* STUDENT */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/scan"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ScanAttendance />
            </ProtectedRoute>
          }
        />

        {/* FACULTY */}
        <Route
          path="/faculty/dashboard"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/students"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/attendance"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/reports"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/create-session"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyCreateSession />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FacultyAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TeacherDetails />
            </ProtectedRoute>
          }
        />

        {/* 🔁 OLD ROUTE SUPPORT */}
        <Route
          path="/student-dashboard"
          element={<Navigate to="/student/dashboard" replace />}
        />
        <Route
          path="/faculty-dashboard"
          element={<Navigate to="/faculty/dashboard" replace />}
        />
        <Route
          path="/admin-dashboard"
          element={<Navigate to="/admin/dashboard" replace />}
        />
      </Routes>
    </>
  );
}

export default App;
