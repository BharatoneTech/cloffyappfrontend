import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdmnSidebar from "../../components/admin/admnsidebar";

import { getProducts, deleteProduct } from "../../api/admin/productApi";

export default function ProductsList() {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getProducts();
      let data = res.data;

      if (Array.isArray(data)) setList(data);
      else if (Array.isArray(data.data)) setList(data.data);
      else if (Array.isArray(data.products)) setList(data.products);
      else setList([]);
    } catch (err) {
      console.error("Failed to load products:", err);
      setList([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await deleteProduct(id);
    load();
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

        <button
          onClick={() => navigate("/admin/products/add")}
          style={{
            padding: "10px 16px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "15px",
          }}
        >
          + Add Product
        </button>

        <div
          style={{
            overflowX: "auto",
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
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
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 20 }}>
                    No products found.
                  </td>
                </tr>
              )}

              {list.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={tdStyle}>{i + 1}</td>

                  {/* PRODUCT with Cloudinary Image */}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {p.product_img && (
                        <img
                          src={p.product_img}    // Cloudinary URL
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
