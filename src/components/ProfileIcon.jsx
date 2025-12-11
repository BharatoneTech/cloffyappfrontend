// src/components/ProfileIcon.jsx
import React from "react";

const isTrue = (v) =>
  v === 1 || v === "1" || v === true || v === "true";

export default function ProfileIcon({ user, onClick }) {
  // 🚫 If no user is logged in → DO NOT show profile icon
  if (!user) return null;

  const isBowl = isTrue(user.bowl_membership);
  const isGold = isTrue(user.golden_membership);

  let bg = "#e5e5e5";     // normal gray background
  let border = "#a3a3a3"; // normal border

  // GOLD membership should override bowl
  if (isGold) {
    bg = "#fef3c7";     // light gold
    border = "#d97706"; // dark gold
  } else if (isBowl) {
    bg = "#d1fae5";     // light green
    border = "#22c55e"; // dark green
  }

  return (
    <div
      onClick={onClick}
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        background: bg,
        border: `2px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "16px",
      }}
    >
      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
    </div>
  );
}
