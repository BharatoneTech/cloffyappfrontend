import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdmnSidebar from "../../components/admin/admnsidebar";

import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../api/admin/productApi";
import { getCategories } from "../../api/admin/categoryApi";

export default function AddEditProduct() {
  const { id } = useParams();
  const edit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    category_id: "",
    product_name: "",
    preparation_time: "",
    net_price: "",
    discount: "",
    bowlmem_discount: "",
    goldenmem_discount: "",
    info: "",
    tagline: "",
    status: "ACTIVE",
  });

  const [imgFile, setImgFile] = useState(null);
  const [oldImg, setOldImg] = useState("");

  const [prices, setPrices] = useState({
    selling_price: 0,
    bowlmem_sellingprice: 0,
    goldenmem_sellingprice: 0,
  });

  const [sameBowl, setSameBowl] = useState(false);
  const [sameGold, setSameGold] = useState(false);

  /* ================= STYLES ================= */
  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    marginTop: "6px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1.5px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
  };

  const labelStyle = {
    fontWeight: "600",
    fontSize: "14px",
    display: "block",
  };

  const sectionCard = {
    background: "#fff",
    padding: "22px",
    marginBottom: "25px",
    borderRadius: "14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadCategories();
    if (edit) loadProduct();
  }, []);

  const loadCategories = async () => {
    const res = await getCategories();
    setCategories(res.data.data);
  };

  const loadProduct = async () => {
    const res = await getProductById(id);
    const p = res.data.data;

    setForm({
      category_id: p.category_id,
      product_name: p.product_name,
      preparation_time: p.preparation_time,
      net_price: p.net_price,
      discount: p.discount,
      bowlmem_discount: p.bowlmem_discount,
      goldenmem_discount: p.goldenmem_discount,
      info: p.info,
      tagline: p.tagline,
      status: p.status,
    });

    setOldImg(p.product_img);
    setSameBowl(p.bowlmem_discount === p.discount);
    setSameGold(p.goldenmem_discount === p.discount);
  };

  /* ================= PRICE CALCULATION ================= */
  useEffect(() => {
    const net = parseFloat(form.net_price) || 0;
    const generalD = parseFloat(form.discount) || 0;

    const selling = +(net * (1 - generalD / 100)).toFixed(2);

    let bowlPrice = selling;
    let goldPrice = selling;

    if (!sameBowl) {
      const bowlD = parseFloat(form.bowlmem_discount) || 0;
      bowlPrice = +(net * (1 - bowlD / 100)).toFixed(2);
    }

    if (!sameGold) {
      const goldD = parseFloat(form.goldenmem_discount) || 0;
      goldPrice = +(net * (1 - goldD / 100)).toFixed(2);
    }

    setPrices({
      selling_price: selling,
      bowlmem_sellingprice: bowlPrice,
      goldenmem_sellingprice: goldPrice,
    });
  }, [
    form.net_price,
    form.discount,
    form.bowlmem_discount,
    form.goldenmem_discount,
    sameBowl,
    sameGold,
  ]);

  const updateField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));

    if (key === "discount") {
      if (sameBowl) setForm((f) => ({ ...f, bowlmem_discount: val }));
      if (sameGold) setForm((f) => ({ ...f, goldenmem_discount: val }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imgFile) fd.append("product_img", imgFile);

    if (edit) await updateProduct(id, fd);
    else await createProduct(fd);

    navigate("/admin/products");
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#f3f4f6" }}>
      <AdmnSidebar />

      <div
        style={{
          marginLeft: "270px",
          width: "calc(100% - 250px)",
          padding: "30px",
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "20px" }}>
          {edit ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={submit} style={{ maxWidth: "900px" }}>
          {/* BASIC INFO */}
          <div style={sectionCard}>
            <h3 style={{ marginBottom: "15px" }}>Basic Information</h3>

            <label style={labelStyle}>Category</label>
            <select
              value={form.category_id}
              onChange={(e) => updateField("category_id", e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Product Name</label>
            <input
              value={form.product_name}
              onChange={(e) => updateField("product_name", e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Preparation Time</label>
            <input
              value={form.preparation_time}
              onChange={(e) =>
                updateField("preparation_time", e.target.value)
              }
              style={inputStyle}
            />

            <label style={labelStyle}>Tagline</label>
            <input
              value={form.tagline}
              onChange={(e) => updateField("tagline", e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Status</label>
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              style={inputStyle}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <label style={labelStyle}>Description</label>
            <textarea
              value={form.info}
              onChange={(e) => updateField("info", e.target.value)}
              style={{ ...inputStyle, height: "110px" }}
            />
          </div>

          {/* PRICING */}
          <div style={sectionCard}>
            <h3 style={{ marginBottom: "15px" }}>Pricing</h3>

            <label style={labelStyle}>Net Price</label>
            <input
              type="number"
              value={form.net_price}
              onChange={(e) => updateField("net_price", e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>General Discount (%)</label>
            <input
              type="number"
              value={form.discount}
              onChange={(e) => updateField("discount", e.target.value)}
              style={inputStyle}
            />

            <label>
              <input
                type="checkbox"
                checked={sameBowl}
                onChange={(e) => {
                  setSameBowl(e.target.checked);
                  if (e.target.checked)
                    updateField("bowlmem_discount", form.discount);
                }}
              />{" "}
              Same for Bowl Member
            </label>

            <input
              type="number"
              disabled={sameBowl}
              value={form.bowlmem_discount}
              onChange={(e) =>
                updateField("bowlmem_discount", e.target.value)
              }
              style={{
                ...inputStyle,
                background: sameBowl ? "#f3f4f6" : "#fff",
              }}
            />

            <label>
              <input
                type="checkbox"
                checked={sameGold}
                onChange={(e) => {
                  setSameGold(e.target.checked);
                  if (e.target.checked)
                    updateField("goldenmem_discount", form.discount);
                }}
              />{" "}
              Same for Gold Member
            </label>

            <input
              type="number"
              disabled={sameGold}
              value={form.goldenmem_discount}
              onChange={(e) =>
                updateField("goldenmem_discount", e.target.value)
              }
              style={{
                ...inputStyle,
                background: sameGold ? "#f3f4f6" : "#fff",
              }}
            />
          </div>

          {/* IMAGE */}
          <div style={sectionCard}>
            <h3>Product Image</h3>

            <input
              type="file"
              onChange={(e) => setImgFile(e.target.files[0])}
            />

            {oldImg && !imgFile && (
              <img
                src={oldImg}
                width={160}
                style={{
                  marginTop: "15px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                }}
              />
            )}
          </div>

          {/* PRICE PREVIEW */}
          <div style={sectionCard}>
            <h3>Final Calculated Prices</h3>
            <p><b>Selling Price:</b> ₹{prices.selling_price}</p>
            <p><b>Bowl Member Price:</b> ₹{prices.bowlmem_sellingprice}</p>
            <p><b>Golden Member Price:</b> ₹{prices.goldenmem_sellingprice}</p>
          </div>

          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #2563eb, #1e40af)",
              color: "white",
              padding: "14px 26px",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {edit ? "Update Product" : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
