import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

// USER PAGES
import LandingLogin from "./pages/user/LandingLogin.jsx";
// import UserDashboard from "./pages/user/UserDashboard.jsx";

// ADMIN PAGES
import AdminLogin from "./pages/admin/AdminLogin.jsx";
// import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

export default function App() {
  return (
    <Routes>

      {/* USER LANDING LOGIN */}
      <Route path="/" element={<LandingLogin />} />

      {/* ADMIN LOGIN */}
      <Route path="/cloffy/admin" element={<AdminLogin />} />

      {/* USER PROTECTED ROUTE */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute roles={["user"]}>
          </ProtectedRoute>
        }
      />

      {/* ADMIN PROTECTED ROUTE */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["admin"]}>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
