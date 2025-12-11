// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roles = [] }) {
  const { token, user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  const isUserRoute = location.pathname.startsWith("/user");
  const isAdminRoute = location.pathname.startsWith("/admin");

  // --------------------------
  // USER PROTECTED ROUTES
  // --------------------------
  if (isUserRoute) {
    if (!token || !user) return <Navigate to="/login" replace />;

    if (roles.length > 0 && !roles.includes("user"))
      return <Navigate to="/login" replace />;

    if (user.role !== "user") return <Navigate to="/login" replace />;

    return children;
  }

  // --------------------------
  // ADMIN PROTECTED ROUTES
  // --------------------------
  if (isAdminRoute) {
    if (!token || !user)
      return <Navigate to="/cloffy/admin" replace />;

    if (roles.length > 0 && !roles.includes("admin"))
      return <Navigate to="/cloffy/admin" replace />;

    if (user.role !== "admin")
      return <Navigate to="/cloffy/admin" replace />;

    return children;
  }

  // Public routes → accessible to everyone
  return children;
}
