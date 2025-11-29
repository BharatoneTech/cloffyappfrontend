import React from "react";
import AdmnSidebar from "../../components/admin/admnsidebar.jsx";

export default function AdminDashboard() {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar - 30% width */}
      <AdmnSidebar />

      {/* Main dashboard area - 70% */}
      <div
        style={{
          marginLeft: "30%",        // pushes content right of sidebar
          width: "70%",
          minHeight: "100vh",
          padding: "40px",
          background: "#f5f7fa",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "10px" }}>
          Welcome to Admin Dashboard
        </h1>

        <p style={{ fontSize: "18px", color: "#555" }}>
          You have successfully logged in as an administrator.
        </p>
      </div>
    </div>
  );
}
