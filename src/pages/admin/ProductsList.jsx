// src/pages/admin/ProductsList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdmnSidebar from "../../components/admin/admnsidebar";

import { getProducts, deleteProduct, bulkUpdateCategoryStatus } from "../../api/admin/productApi";
import { getCategories } from "../../api/admin/categoryApi";

export default function ProductsList() {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters / Pagination
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const ITEMS_PER_PAGE = 20; // user requested
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      let data = res.data;

      // normalize
      if (Array.isArray(data)) setList(data);
      else if (Array.isArray(data.data)) setList(data.data);
      else if (Array.isArray(data.products)) setList(data.products);
      else setList([]);
    } catch (err) {
      console.error("Failed to load products:", err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to load categories", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  // Combined filtered list (search + category)
  const filtered = useMemo(() => {
    const s = (search || "").trim().toLowerCase();
    return list.filter((p) => {
      if (selectedCategoryId && String(p.category_id) !== String(selectedCategoryId)) return false;

      if (!s) return true;
      // search by product_name only as requested
      return String(p.product_name || "").toLowerCase().includes(s);
    });
  }, [list, search, selectedCategoryId]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const remove = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await deleteProduct(id);
    await load();
  };

  // Bulk activate/inactivate by category
  const changeCategoryStatus = async (categoryId, status) => {
    if (!categoryId) {
      window.alert("Please select a category first.");
      return;
    }
    const c = categories.find((x) => String(x.id) === String(categoryId));
    const name = c ? c.category_name : "this category";
    const ok = window.confirm(`Are you sure you want to set status='${status}' for ALL products in "${name}"?`);
    if (!ok) return;

    try {
      setLoading(true);
      await bulkUpdateCategoryStatus(categoryId, status);
      window.alert(`All products in "${name}" have been set to ${status}.`);
      await load();
    } catch (err) {
      console.error("Bulk status update failed", err);
      window.alert("Failed to update products. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", width: "100%", background: "#f7f7f7" }}>
      <AdmnSidebar />

      <div
        style={{
          marginLeft: "260px",
          padding: "30px",
          width: "calc(100% - 250px)",
        }}
      >
        <h2 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "20px" }}>
          Products List
        </h2>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <button
            onClick={() => navigate("/admin/products/add")}
            style={{
              padding: "10px 16px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            + Add Product
          </button>

          <input
            placeholder="Search product name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ padding: 10, width: 300, borderRadius: 6 }}
          />

          <select
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              setPage(1);
            }}
            style={{ padding: 10, borderRadius: 6 }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>

          {/* Bulk category actions */}
          <div style={{ marginLeft: 8, display: "flex", gap: 8 }}>
            <button
              onClick={() => changeCategoryStatus(selectedCategoryId, "INACTIVE")}
              style={{
                padding: "8px 12px",
                background: "#e53935",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Inactivate All (Category)
            </button>

            <button
              onClick={() => changeCategoryStatus(selectedCategoryId, "ACTIVE")}
              style={{
                padding: "8px 12px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Activate All (Category)
            </button>
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#ececec" }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Net Price</th>
                  <th style={thStyle}>Selling Price</th>
                  <th style={thStyle}>Bowl Member Price</th>
                  <th style={thStyle}>Golden Member Price</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
                      No products found.
                    </td>
                  </tr>
                )}

                {paged.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={tdStyle}>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>

                    {/* PRODUCT with Cloudinary Image */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {p.product_img && (
                          <img
                            src={p.product_img}
                            width={60}
                            height={50}
                            style={{
                              objectFit: "cover",
                              borderRadius: 5,
                              border: "1px solid #ccc",
                            }}
                            alt="product"
                          />
                        )}

                        <div>
                          <strong>{p.product_name}</strong>
                          <div style={{ fontSize: 12, color: "#666" }}>{p.tagline}</div>
                        </div>
                      </div>
                    </td>

                    <td style={tdStyle}>{p.category_name}</td>
                    <td style={tdStyle}>₹{p.net_price}</td>
                    <td style={tdStyle}>₹{p.selling_price}</td>
                    <td style={tdStyle}>₹{p.bowlmem_sellingprice}</td>
                    <td style={tdStyle}>₹{p.goldenmem_sellingprice}</td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          background: p.status === "ACTIVE" ? "#e6f9ec" : "#fff0f0",
                          color: p.status === "ACTIVE" ? "#1a7f3a" : "#c62828",
                          fontWeight: "600",
                        }}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                        style={editBtn}
                      >
                        Edit
                      </button>

                      <button onClick={() => remove(p.id)} style={deleteBtn}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer" }}
          >
            Prev
          </button>

          <div>
            Page{" "}
            <strong>
              {page}
            </strong>{" "}
            of {totalPages}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------
const thStyle = {
  padding: "12px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "bold",
  borderBottom: "2px solid #ccc",
};

const tdStyle = {
  padding: "12px",
  fontSize: "14px",
};

const editBtn = {
  padding: "6px 12px",
  background: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "6px",
};

const deleteBtn = {
  padding: "6px 12px",
  background: "#e53935",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
