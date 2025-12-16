// src/components/ProfileMenu.jsx
import React from "react";

export default function ProfileMenu({ onClose, onHistory, onRewards, onLogout }) {
  return (
    <div
    
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
