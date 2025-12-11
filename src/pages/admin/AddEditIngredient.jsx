import React, { useEffect, useState } from "react";
import AdmnSidebar from "../../components/admin/admnsidebar";
import { useNavigate, useParams } from "react-router-dom";

import {
  getIngredientById,
  createIngredient,
  updateIngredient,
} from "../../api/admin/ingredientApi";

import { getCategories } from "../../api/admin/categoryApi";
import { getProductsByCategory } from "../../api/admin/productApi";

export default function AddEditIngredient() {
  const { id } = useParams();
  const edit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    category_id: "",
    product_id: "",
    ingredients: "",
    price: "",
  });

  useEffect(() => {
    loadCategories();
    if (edit) loadIngredient();
  }, []);

  const loadCategories = async () => {
    const res = await getCategories();
    setCategories(res.data.data);
  };

  const loadProducts = async (catId) => {
    const res = await getProductsByCategory(catId);
    setProducts(res.data.data);
  };

  const loadIngredient = async () => {
    const res = await getIngredientById(id);
    const d = res.data.data;

    setForm({
      category_id: d.category_id,
      product_id: d.product_id,
      ingredients: d.ingredients,
      price: d.price,
    });

    loadProducts(d.category_id);
  };

  const updateField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));

    if (k === "category_id") {
      loadProducts(v);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (edit) {
      await updateIngredient(id, form);
    } else {
      await createIngredient(form);
    }

    navigate("/admin/ingredients");
  };

  // -------------- UI Styles ----------------

  const inputBox = {
    padding: "12px",
    width: "100%",
    marginTop: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
  };

  const sectionCard = {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "700px",
  };

  const labelStyle = {
    fontWeight: "600",
    fontSize: "14px",
    marginTop: "15px",
  };

  const submitBtn = {
    marginTop: "25px",
    background: "#007bff",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    width: "200px",
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <AdmnSidebar />

      <div
        style={{
          marginLeft: "270px",
          width: "calc(100% - 250px)",
          padding: "40px",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "30px",
          }}
        >
          {edit ? "Edit Ingredient" : "Add New Ingredient"}
        </h2>

        <div style={sectionCard}>
          <form onSubmit={submit}>

            {/* CATEGORY */}
            <label style={labelStyle}>Select Category</label>
            <select
              value={form.category_id}
              onChange={(e) => updateField("category_id", e.target.value)}
              style={inputBox}
              required
            >
              <option value="">Choose Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>

            {/* PRODUCT */}
            <label style={labelStyle}>Select Product</label>
            <select
              value={form.product_id}
              onChange={(e) => updateField("product_id", e.target.value)}
              style={inputBox}
              required
            >
              <option value="">Choose Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name}
                </option>
              ))}
            </select>

            {/* INGREDIENT */}
            <label style={labelStyle}>Ingredient Name</label>
            <input
              value={form.ingredients}
              onChange={(e) => updateField("ingredients", e.target.value)}
              placeholder="Ingredient Name"
              style={inputBox}
              required
            />

            {/* PRICE */}
            <label style={labelStyle}>Price</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              placeholder="Enter Price"
              style={inputBox}
              required
            />

            {/* SUBMIT */}
            <button type="submit" style={submitBtn}>
              {edit ? "Update Ingredient" : "Create Ingredient"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
