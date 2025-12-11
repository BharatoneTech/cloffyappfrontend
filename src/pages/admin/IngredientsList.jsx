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
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getIngredients();

      if (!res || !res.data) {
        setError("No response from server");
        setList([]);
        return;
      }

      let data = res.data;

      if (Array.isArray(data)) setList(data);
      else if (Array.isArray(data.data)) setList(data.data);
      else if (Array.isArray(data.ingredients)) setList(data.ingredients);
      else {
        setList([]);
        setError("No ingredients found");
      }

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

        <button
          onClick={() => navigate("/admin/ingredients/add")}
          style={addBtn}
        >
          + Add Ingredient
        </button>

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
              {list.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No ingredients found.
                  </td>
                </tr>
              )}

              {list.map((ing, i) => (
                <tr key={ing.id}>
                  <td style={td}>{i + 1}</td>
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
        </div>
      </div>
    </div>
  );
}
