import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roles = [] }) {
  const { token, user, loading } = useContext(AuthContext);

  // Still loading user data
  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // If not logged in → redirect to landing login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // If route requires certain roles → validate
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Access granted → show child component
  return children;
}
