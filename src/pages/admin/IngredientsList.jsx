import React, { useEffect, useState } from "react";
import AdmnSidebar from "../../components/admin/admnsidebar";
import { useNavigate } from "react-router-dom";

import {
  getIngredients,
  deleteIngredient,
} from "../../api/admin/ingredientApi";

export default function IngredientsList() {
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  // 🔍 SEARCH
  const [search, setSearch] = useState("");

  // 📄 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getIngredients();
      let data = res?.data?.data || res?.data || [];
      setList(data);
      setError("");
    } catch (err) {
      console.log("Error loading ingredients:", err);
      setError("Failed to fetch ingredient list");
      setList([]);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete ingredient?")) return;
    await deleteIngredient(id);
    load();
  };

  /* ===============================
     SEARCH FILTER
  ================================ */
  const filteredList = list.filter((ing) => {
    const text = search.toLowerCase();
    return (
      ing.ingredients?.toLowerCase().includes(text) ||
      ing.category_name?.toLowerCase().includes(text) ||
      ing.product_name?.toLowerCase().includes(text)
    );
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

  // ---------- UI styles ------------
  const card = {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
    marginTop: "20px",
  };

  const addBtn = {
    padding: "10px 16px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "15px",
    fontSize: "15px",
  };

  const searchBox = {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "260px",
    marginLeft: "15px",
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
          Additional Ingredients
        </h2>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              background: "#ffe6e6",
              padding: "12px",
              marginTop: "15px",
              borderRadius: "8px",
              color: "#b30000",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => navigate("/admin/ingredients/add")}
            style={addBtn}
          >
            + Add Ingredient
          </button>

          <input
            placeholder="Search ingredient / category / product"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={searchBox}
          />
        </div>

        <div style={card}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Ingredient</th>
                <th style={th}>Category</th>
                <th style={th}>Product</th>
                <th style={th}>Price</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedList.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No ingredients found.
                  </td>
                </tr>
              )}

              {paginatedList.map((ing, i) => (
                <tr key={ing.id}>
                  <td style={td}>{startIndex + i + 1}</td>
                  <td style={td}>{ing.ingredients}</td>
                  <td style={td}>{ing.category_name}</td>
                  <td style={td}>{ing.product_name}</td>
                  <td style={td}>₹{ing.price}</td>

                  <td style={td}>
                    <button
                      onClick={() =>
                        navigate(`/admin/ingredients/edit/${ing.id}`)
                      }
                      style={editBtn}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => remove(ing.id)}
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

            <span style={{ margin: "0 12px" }}>
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
