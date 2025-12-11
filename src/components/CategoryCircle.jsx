// src/components/CategoryCircle.jsx
import React from "react";

export default function CategoryCircle({ category, selected, onClick }) {
  // ✅ FIX: use only category.image (Cloudinary URL)
  const imageUrl = category.image || "https://via.placeholder.com/80";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: "72px",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "999px",
          overflow: "hidden",
          border: selected ? "3px solid #f97316" : "2px solid #e5e7eb",
          boxShadow: selected
            ? "0 0 0 2px rgba(249,115,22,0.25)"
            : "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: "4px",
          background: "#f3f4f6",
        }}
      >
        <img
          src={imageUrl}
          alt={category.category_name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <span
        style={{
          fontSize: "11px",
          fontWeight: selected ? 700 : 500,
          color: selected ? "#111827" : "#4b5563",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {category.category_name}
      </span>
    </button>
  );
}
