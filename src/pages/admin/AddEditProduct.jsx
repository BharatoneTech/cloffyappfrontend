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

    setOldImg(p.product_img); // Cloudinary URL

    setSameBowl(p.bowlmem_discount === p.discount);
    setSameGold(p.goldenmem_discount === p.discount);
  };

  // PRICE CALCULATION
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

  // ---------------- UI ----------------

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
        <h2
          style={{
            fontSize: "26px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          {edit ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={submit} style={{ maxWidth: "900px" }}>
          {/* BASIC INFO */}
          <div
            style={{
              background: "white",
              padding: "20px",
              marginBottom: "25px",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
            }}
          >
            <h3>Basic Information</h3>

            <label>Category</label>
            <select
              value={form.category_id}
              onChange={(e) => updateField("category_id", e.target.value)}
              required
              style={{ width: "100%", padding: 12, marginTop: 6 }}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>

            <label>Product Name</label>
            <input
              value={form.product_name}
              onChange={(e) => updateField("product_name", e.target.value)}
              style={{ width: "100%", padding: 12, marginTop: 6 }}
            />

            <label>Preparation Time</label>
            <input
              value={form.preparation_time}
              onChange={(e) => updateField("preparation_time", e.target.value)}
              style={{ width: "100%", padding: 12, marginTop: 6 }}
            />

            <label>Tagline</label>
            <input
              value={form.tagline}
              onChange={(e) => updateField("tagline", e.target.value)}
              style={{ width: "100%", padding: 12, marginTop: 6 }}
            />

            <label>Description</label>
            <textarea
              value={form.info}
              onChange={(e) => updateField("info", e.target.value)}
              style={{ width: "100%", padding: 12, marginTop: 6, height: 100 }}
            />
          </div>

          {/* PRICING */}
          <div
            style={{
              background: "white",
              padding: "20px",
              marginBottom: "25px",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
            }}
          >
            <h3>Pricing</h3>

            <label>Net Price</label>
            <input
              type="number"
              value={form.net_price}
              onChange={(e) => updateField("net_price", e.target.value)}
              style={{ width: "100%", padding: 12, marginTop: 6 }}
            />

            <label>General Discount (%)</label>
            <input
              type="number"
              value={form.discount}
              onChange={(e) => updateField("discount", e.target.value)}
              style={{ width: "100%", padding: 12, marginTop: 6 }}
            />

            {/* Bowl Discount */}
            <div style={{ marginTop: 20 }}>
              <input
                type="checkbox"
                checked={sameBowl}
                onChange={(e) => {
                  setSameBowl(e.target.checked);
                  if (e.target.checked) {
                    updateField("bowlmem_discount", form.discount);
                  }
                }}
              />
              <label style={{ marginLeft: 10 }}>Same for Bowl Member</label>

              <input
                type="number"
                disabled={sameBowl}
                value={form.bowlmem_discount}
                onChange={(e) => updateField("bowlmem_discount", e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 6,
                  background: sameBowl ? "#eee" : "white",
                }}
                placeholder="Bowl Member Discount %"
              />
            </div>

            {/* Gold Discount */}
            <div style={{ marginTop: 20 }}>
              <input
                type="checkbox"
                checked={sameGold}
                onChange={(e) => {
                  setSameGold(e.target.checked);
                  if (e.target.checked) {
                    updateField("goldenmem_discount", form.discount);
                  }
                }}
              />
              <label style={{ marginLeft: 10 }}>Same for Gold Member</label>

              <input
                type="number"
                disabled={sameGold}
                value={form.goldenmem_discount}
                onChange={(e) => updateField("goldenmem_discount", e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 6,
                  background: sameGold ? "#eee" : "white",
                }}
                placeholder="Golden Member Discount %"
              />
            </div>
          </div>

          {/* IMAGE */}
          <div
            style={{
              background: "white",
              padding: "20px",
              marginBottom: "25px",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
            }}
          >
            <h3>Product Image</h3>

            <input type="file" onChange={(e) => setImgFile(e.target.files[0])} />

            {oldImg && !imgFile && (
              <img
                src={oldImg} // Show Cloudinary URL
                width={160}
                style={{
                  marginTop: "15px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                }}
              />
            )}
          </div>

          {/* PRICE PREVIEW */}
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
            }}
          >
            <h3>Final Calculated Prices</h3>

            <p><b>Selling Price:</b> ₹{prices.selling_price}</p>
            <p><b>Bowl Member Price:</b> ₹{prices.bowlmem_sellingprice}</p>
            <p><b>Golden Member Price:</b> ₹{prices.goldenmem_sellingprice}</p>
          </div>

          <button
            type="submit"
            style={{
              background: "#007bff",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "20px",
            }}
          >
            {edit ? "Update Product" : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
