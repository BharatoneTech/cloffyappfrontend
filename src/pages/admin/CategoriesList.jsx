import React, { useEffect, useState } from "react";
import AdmnSidebar from "../../components/admin/admnsidebar";
import { useNavigate } from "react-router-dom";

import {
  getCategories,
  deleteCategory,
} from "../../api/admin/categoryApi";

export default function CategoriesList() {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getCategories();
      let data = res.data;

      if (Array.isArray(data)) setList(data);
      else if (Array.isArray(data.data)) setList(data.data);
      else if (Array.isArray(data.categories)) setList(data.categories);
      else setList([]);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setList([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await deleteCategory(id);
    load();
  };

  const card = {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    marginTop: "20px",
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <AdmnSidebar />

      <div
        style={{
          marginLeft: "270px",
          width: "calc(100% - 250px)",
          padding: "30px",
        }}
      >
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Categories</h2>

        <button
          onClick={() => navigate("/admin/categories/add")}
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
          + Add Category
        </button>

        <div style={card}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Category Name</th>
                <th style={th}>Image</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: "20px", textAlign: "center" }}>
                    No categories found.
                  </td>
                </tr>
              )}

              {list.map((c, i) => (
                <tr key={c.id}>
                  <td style={td}>{i + 1}</td>
                  <td style={td}>{c.category_name}</td>

                  <td style={td}>
                    {c.image && (
                      <img
                        src={c.image}       // Cloudinary URL directly
                        width={60}
                        height={60}
                        style={{
                          objectFit: "cover",
                          borderRadius: "10px",
                          border: "1px solid #ccc",
                        }}
                        alt="category"
                      />
                    )}
                  </td>

                  <td style={td}>
                    <span
                      style={{
                        padding: "4px 10px",
                        background: c.status === "ACTIVE" ? "#4CAF50" : "#777",
                        color: "white",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td style={td}>
                    <button
                      onClick={() => navigate(`/admin/categories/edit/${c.id}`)}
                      style={editBtn}
                    >
                      Edit
                    </button>

                    <button onClick={() => remove(c.id)} style={deleteBtn}>
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

// ---------- UI STYLES ----------
const th = {
  background: "#f5f5f5",
  padding: "12px",
  textAlign: "left",
  borderBottom: "2px solid #ddd",
  fontWeight: "600",
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #eee",
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
