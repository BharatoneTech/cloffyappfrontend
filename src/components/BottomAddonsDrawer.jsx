// src/components/BottomAddonsDrawer.jsx
import React from "react";

export default function BottomAddonsDrawer({
  isOpen,
  onClose,
  product,
  addons = [],
  selectedAddons = [],
  toggleAddon,
  onAdd,
  price,
}) {
  if (!isOpen || !product) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 99999,
        display: "flex",
        justifyContent: "center",
        alignItems: "end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "#fff",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          padding: 16,
          maxHeight: "78vh",
          overflowY: "auto",
          boxShadow: "0 -8px 30px rgba(0,0,0,0.2)",
          animation: "slideUp 220ms ease",
        }}
      >
        <style>
          {`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            .addon-label { cursor: pointer; }
          `}
        </style>

        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div style={{ width: 48, height: 5, background: "#e5e7eb", borderRadius: 10 }} />
        </div>

        {/* Product header */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
          <img
            src={product.product_img}
            alt={product.product_name}
            style={{ width: 84, height: 84, borderRadius: 10, objectFit: "cover" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{product.product_name}</div>
            {product.tagline && <div style={{ fontSize: 13, color: "#6b7280" }}>{product.tagline}</div>}
            <div style={{ marginTop: 6, fontWeight: 700 }}>₹ {price}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="close"
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ✕
          </button>
        </div>

        {/* Addons list */}
        <div>
          <h4 style={{ margin: "8px 0 12px", fontSize: 15 }}>Additional Ingredients</h4>

          {addons.length === 0 && (
            <div style={{ color: "#6b7280", fontSize: 13 }}>No add-ons available for this item.</div>
          )}

          {addons.map((addon) => {
            const checked = selectedAddons.includes(addon.id);
            // addon may have different label keys (ingredients/name)
            const title = addon.ingredients || addon.name || addon.title || "Addon";
            const priceText = addon.price != null ? `+₹ ${addon.price}` : "";
            return (
              <label
                key={addon.id}
                className="addon-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 6px",
                  borderBottom: "1px solid #f1f1f1",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{title}</div>
                  {priceText && <div style={{ fontSize: 12, color: "#6b7280" }}>{priceText}</div>}
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAddon(addon.id)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
              </label>
            );
          })}
        </div>

        {/* Add button */}
        <div style={{ marginTop: 14 }}>
          <button
            onClick={onAdd}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "none",
              background: "#401A13",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
