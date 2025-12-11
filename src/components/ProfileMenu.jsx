// src/components/ProfileMenu.jsx
import React from "react";

export default function ProfileMenu({ onClose, onHistory, onRewards, onLogout }) {
  return (
    <div
      style={{
        position: "absolute",
        right: 10,
        top: 60,
        background: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        padding: "12px",
        width: "160px",
        zIndex: 100,
      }}
    >
      <div
        onClick={onHistory}
        style={{
          padding: "8px",
          cursor: "pointer",
          borderBottom: "1px solid #eee",
        }}
      >
        🧾 Order History
      </div>

      <div
        onClick={onRewards}
        style={{
          padding: "8px",
          cursor: "pointer",
          borderBottom: "1px solid #eee",
        }}
      >
        🎁 View Rewards
      </div>

      <div
        onClick={onLogout}
        style={{
          padding: "8px",
          cursor: "pointer",
          color: "red",
          fontWeight: "600",
        }}
      >
        🚪 Logout
      </div>
    </div>
  );
}
