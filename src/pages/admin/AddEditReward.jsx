import React, { useEffect, useState } from "react";
import AdmnSidebar from "../../components/admin/admnsidebar";
import { useNavigate, useParams } from "react-router-dom";

import { getCategories } from "../../api/admin/categoryApi";
import { getProductsByCategory } from "../../api/admin/productApi";

import {
  createReward,
  updateReward,
  getRewardById,
} from "../../api/admin/rewardsApi";

export default function AddEditReward() {
  const { id } = useParams();
  const edit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    coupon_code: "",
    category_id: "",
    product_id: "",
    apply_on: "PRICE",
    buy: "",
    get: "",
    percentage: "",
  });

  useEffect(() => {
    loadCats();
    if (edit) loadReward();
  }, [id]);

  const loadCats = async () => {
    const res = await getCategories();
    setCategories(res.data.data || res.data || []);
  };

  const loadProducts = async (categoryId) => {
    if (!categoryId) return;
    const res = await getProductsByCategory(categoryId);
    setProducts(res.data.data || []);
  };

  const loadReward = async () => {
    const res = await getRewardById(id);
    const data = res.data.data;

    setForm({
      coupon_code: data.coupon_code,
      category_id: data.category_id,
      product_id: data.product_id,
      apply_on: data.apply_on,
      buy: data.buy,
      get: data.get,
      percentage: data.percentage,
    });

    if (data.category_id) loadProducts(data.category_id);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "category_id") {
      loadProducts(e.target.value);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (edit) await updateReward(id, form);
    else await createReward(form);

    navigate("/admin/rewards");
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <AdmnSidebar />

      <div style={{ marginLeft: "260px", padding: "40px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700" }}>
          {edit ? "Edit Reward" : "Add Reward"}
        </h2>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
            width: "650px",
          }}
        >
          <form onSubmit={submit}>
            {/* COUPON CODE */}
            <label>Coupon Code</label>
            <input
              name="coupon_code"
              value={form.coupon_code}
              onChange={handleChange}
              style={inputBox}
              required
            />

            {/* APPLY ON */}
            <label>Apply On</label>
            <select
              name="apply_on"
              value={form.apply_on}
              onChange={handleChange}
              style={inputBox}
            >
              <option value="PRICE">PRICE</option>
              <option value="PRODUCT">PRODUCT (Buy X Get Y)</option>
            </select>

            {/* CATEGORY */}
            <label>Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              style={inputBox}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>

            {/* PRODUCT */}
            <label>Product</label>
            <select
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
              style={inputBox}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name}
                </option>
              ))}
            </select>

            {/* BUY X */}
            {form.apply_on === "PRODUCT" && (
              <>
                <label>Buy</label>
                <input
                  name="buy"
                  value={form.buy}
                  onChange={handleChange}
                  style={inputBox}
                />

                <label>Get</label>
                <input
                  name="get"
                  value={form.get}
                  onChange={handleChange}
                  style={inputBox}
                />
              </>
            )}

            {/* DISCOUNT PERCENT */}
            {form.apply_on === "PRICE" && (
              <>
                <label>Percentage %</label>
                <input
                  name="percentage"
                  value={form.percentage}
                  onChange={handleChange}
                  style={inputBox}
                />
              </>
            )}

            <button style={submitBtn} type="submit">
              {edit ? "Update" : "Create"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputBox = {
  padding: "12px",
  width: "100%",
  marginTop: "6px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "15px",
};

const submitBtn = {
  marginTop: "20px",
  padding: "12px 20px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
};
