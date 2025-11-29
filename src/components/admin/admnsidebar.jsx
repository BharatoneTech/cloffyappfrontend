import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdmnSidebar() {
  const location = useLocation();

  const menu = [
    { name: "Categories", path: "/admin/categories" },
    { name: "Products", path: "/admin/products" },
    { name: "Additional Ingredients", path: "/admin/additional-ingredients" },
    { name: "Rewards / Coupons", path: "/admin/rewards" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Payments", path: "/admin/payments" },
    { name: "Admin Users", path: "/admin/staff" },
  ];

  return (
    <div
      style={{
        width: "22%",
        height: "100vh",
        background: "#1f1f1f",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>Admin Panel</h2>

      {menu.map((item) => {
        const active = location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: "none",
              color: active ? "black" : "white",
              padding: "12px 15px",
              borderRadius: "6px",
              background: active ? "#fbbf24" : "transparent",
              fontWeight: active ? "600" : "400",
              transition: "0.2s",
            }}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
