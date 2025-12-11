import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function AdmnSidebar() {
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  // Dropdown states
  const [catOpen, setCatOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);
  const [ingOpen, setIngOpen] = useState(false);
  const [rewOpen, setRewOpen] = useState(false);

  // Highlight active route
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div
      style={{
        width: "250px",
        height: "95vh",
        background: "#42241CFF",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        position: "fixed",
        left: 0,
        top: 0,
        overflowY: "auto",
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "15px", fontWeight: "700" }}>
        Admin Panel
      </h2>

      {/* ---------------- CATEGORIES ---------------- */}
      <div
        onClick={() => setCatOpen(!catOpen)}
        style={{
          padding: "12px 15px",
          borderRadius: "6px",
          background: isActive("/admin/categories") ? "#fbbf24" : "transparent",
          color: isActive("/admin/categories") ? "black" : "white",
          cursor: "pointer",
          fontWeight: isActive("/admin/categories") ? "700" : "400",
          transition: "0.2s",
        }}
      >
        Categories {catOpen ? "▲" : "▼"}
      </div>

      {catOpen && (
        <div
          style={{
            marginLeft: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <Link
            to="/admin/categories/add"
            style={{
              color: isActive("/admin/categories/add") ? "#fbbf24" : "white",
              textDecoration: "none",
            }}
          >
            ➕ Add Category
          </Link>

          <Link
            to="/admin/categories"
            style={{
              color: isActive("/admin/categories") ? "#fbbf24" : "white",
              textDecoration: "none",
            }}
          >
            📄 View Categories
          </Link>
        </div>
      )}

      {/* ---------------- PRODUCTS ---------------- */}
      <div
        onClick={() => setProdOpen(!prodOpen)}
        style={{
          padding: "12px 15px",
          borderRadius: "6px",
          background: isActive("/admin/products") ? "#fbbf24" : "transparent",
          color: isActive("/admin/products") ? "black" : "white",
          cursor: "pointer",
          fontWeight: isActive("/admin/products") ? "700" : "400",
          transition: "0.2s",
        }}
      >
        Products {prodOpen ? "▲" : "▼"}
      </div>

      {prodOpen && (
        <div
          style={{
            marginLeft: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <Link
            to="/admin/products/add"
            style={{
              color: isActive("/admin/products/add") ? "#fbbf24" : "white",
              textDecoration: "none",
            }}
          >
            ➕ Add Product
          </Link>

          <Link
            to="/admin/products"
            style={{
              color: isActive("/admin/products") ? "#fbbf24" : "white",
              textDecoration: "none",
            }}
          >
            📄 View Products
          </Link>
        </div>
      )}

      {/* ---------------- INGREDIENTS ---------------- */}
      <div
        onClick={() => setIngOpen(!ingOpen)}
        style={{
          padding: "12px 15px",
          borderRadius: "6px",
          background: isActive("/admin/ingredients") ? "#fbbf24" : "transparent",
          color: isActive("/admin/ingredients") ? "black" : "white",
          cursor: "pointer",
          fontWeight: isActive("/admin/ingredients") ? "700" : "400",
          transition: "0.2s",
        }}
      >
        Additional Ingredients {ingOpen ? "▲" : "▼"}
      </div>

      {ingOpen && (
        <div
          style={{
            marginLeft: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <Link
            to="/admin/ingredients/add"
            style={{
              color: isActive("/admin/ingredients/add") ? "#fbbf24" : "white",
              textDecoration: "none",
            }}
          >
            ➕ Add Ingredient
          </Link>

          <Link
            to="/admin/ingredients"
            style={{
              color: isActive("/admin/ingredients") ? "#fbbf24" : "white",
              textDecoration: "none",
            }}
          >
            📄 View Ingredients
          </Link>
        </div>
      )}

      {/* ---------------- REWARDS / COUPONS ---------------- */}
      <div
        onClick={() => setRewOpen(!rewOpen)}
        style={{
          padding: "12px 15px",
          borderRadius: "6px",
          background: isActive("/admin/rewards") ? "#fbbf24" : "transparent",
          color: isActive("/admin/rewards") ? "black" : "white",
          cursor: "pointer",
          fontWeight: isActive("/admin/rewards") ? "700" : "400",
          transition: "0.2s",
        }}
      >
        Rewards / Coupons {rewOpen ? "▲" : "▼"}
      </div>

      {rewOpen && (
        <div
          style={{
            marginLeft: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <Link
            to="/admin/rewards/add"
            style={{
              color: isActive("/admin/rewards/add") ? "#fbbf24" : "white",
              textDecoration: "none",
            }}
          >
            ➕ Add Reward
          </Link>

          <Link
            to="/admin/rewards"
            style={{
              color: isActive("/admin/rewards") ? "#fbbf24" : "white",
              textDecoration: "none",
            }}
          >
            🎁 View Rewards
          </Link>
        </div>
      )}

      {/* ---------------- OTHER LINKS ---------------- */}
      <Link
        to="/admin/orders"
        style={{
          textDecoration: "none",
          color: isActive("/admin/orders") ? "black" : "white",
          padding: "12px 15px",
          borderRadius: "6px",
          background: isActive("/admin/orders") ? "#fbbf24" : "transparent",
        }}
      >
        Orders
      </Link>

      <Link
        to="/admin/payments"
        style={{
          textDecoration: "none",
          color: isActive("/admin/payments") ? "black" : "white",
          padding: "12px 15px",
          borderRadius: "6px",
          background: isActive("/admin/payments") ? "#fbbf24" : "transparent",
        }}
      >
        Payments
      </Link>

      <Link
        to="/admin/staff"
        style={{
          textDecoration: "none",
          color: isActive("/admin/staff") ? "black" : "white",
          padding: "12px 15px",
          borderRadius: "6px",
          background: isActive("/admin/staff") ? "#fbbf24" : "transparent",
        }}
      >
        Admin Users
      </Link>

      {/* ---------------- LOGOUT BUTTON ---------------- */}
      <button
        onClick={() => {
          logout();
          window.location.href = "/cloffy/admin";
        }}
        style={{
          marginTop: "auto",
          padding: "12px 15px",
          background: "#e53935",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        Logout
      </button>
    </div>
  );
}
