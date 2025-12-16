import React, { useEffect, useState } from "react";
import AdmnSidebar from "../../components/admin/admnsidebar";
import { useNavigate } from "react-router-dom";

import {
  getCategories,
  deleteCategory,
  activateAllCategories,
  inactivateAllCategories,
} from "../../api/admin/categoryApi";

export default function CategoriesList() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  const load = async () => {
    const res = await getCategories();
    const data = res.data?.data || res.data || [];
    setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await deleteCategory(id);
    load();
  };

  /* ===============================
     SEARCH + STATUS FILTER
  ================================ */
  const filteredList = list.filter((c) => {
    const matchSearch = c.category_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" || c.status === statusFilter;

    return matchSearch && matchStatus;
  });

  /* ===============================
     PAGINATION
  ================================ */
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>
          Categories
        </h2>

        {/* ACTION BUTTONS */}
        <div style={{ marginBottom: "15px" }}>
          <button
            onClick={() => navigate("/admin/categories/add")}
            style={addBtn}
          >
            + Add Category
          </button>

         <button
          onClick={async () => {
            if (!window.confirm("Activate ALL categories?")) return;
            await activateAllCategories();
            load();
          }}
          style={activateBtn}
        >
          Activate All
        </button>

          <button
            onClick={async () => {
              if (!window.confirm("Inactivate ALL categories?")) return;
              await inactivateAllCategories();
              load();
            }}
            style={bulkBtn}
          >
            Inactivate All
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <input
            placeholder="Search category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={searchBox}
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={searchBox}
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div style={card}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Category</th>
                <th style={th}>Image</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedList.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    No categories found
                  </td>
                </tr>
              )}

              {paginatedList.map((c, i) => (
                <tr key={c.id}>
                  <td style={td}>{startIndex + i + 1}</td>
                  <td style={td}>{c.category_name}</td>

                  <td style={td}>
                    {c.image && (
                      <img
                        src={c.image}
                        width={60}
                        height={60}
                        style={{
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    )}
                  </td>

                  <td style={td}>
                    <span
                      style={{
                        padding: "4px 10px",
                        background:
                          c.status === "ACTIVE" ? "#4CAF50" : "#999",
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
                      onClick={() =>
                        navigate(`/admin/categories/edit/${c.id}`)
                      }
                      style={editBtn}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => remove(c.id)}
                      style={deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ◀ Prev
            </button>

            <span style={{ margin: "0 10px" }}>
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   STYLES
================================ */
const searchBox = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const addBtn = {
  padding: "10px 16px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const bulkBtn = {
  padding: "10px 16px",
  background: "#ff9800",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginLeft: "10px",
};

const th = {
  background: "#f5f5f5",
  padding: "12px",
  borderBottom: "2px solid #ddd",
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

const activateBtn = {
  padding: "10px 16px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginLeft: "10px",
};

const inactivateBtn = {
  padding: "10px 16px",
  background: "#ff9800",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginLeft: "10px",
};