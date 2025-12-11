import React, { useEffect, useState } from "react";
import AdmnSidebar from "../../components/admin/admnsidebar";
import { useNavigate, useParams } from "react-router-dom";

import {
  getCategoryById,
  createCategory,
  updateCategory,
} from "../../api/admin/categoryApi";

export default function AddEditCategory() {
  const { id } = useParams();
  const edit = Boolean(id);

  const navigate = useNavigate();

  const [category_name, setName] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [file, setFile] = useState(null);
  const [oldImage, setOld] = useState("");

  useEffect(() => {
    if (edit) load();
  }, [id]);

  const load = async () => {
    const res = await getCategoryById(id);
    const data = res.data.data;

    setName(data.category_name);
    setStatus(data.status);
    setOld(data.image); // Cloudinary URL directly
  };

  const submit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("category_name", category_name);
    fd.append("status", status);
    if (file) fd.append("image", file);

    if (edit) {
      await updateCategory(id, fd);
    } else {
      await createCategory(fd);
    }

    navigate("/admin/categories");
  };

  // ---------------- UI styles ----------------
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
        <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "30px" }}>
          {edit ? "Edit Category" : "Add New Category"}
        </h2>

        <div style={sectionCard}>
          <form onSubmit={submit}>
            {/* CATEGORY NAME */}
            <label style={labelStyle}>Category Name</label>
            <input
              value={category_name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Category Name"
              style={inputBox}
              required
            />

            {/* STATUS */}
            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={inputBox}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            {/* IMAGE */}
            <label style={labelStyle}>Category Image</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ marginTop: "6px" }}
            />

            {/* IMAGE PREVIEW */}
            {oldImage && !file && (
              <div style={{ marginTop: "15px" }}>
                <img
                  src={oldImage}   // Cloudinary image
                  width={160}
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button type="submit" style={submitBtn}>
              {edit ? "Update Category" : "Create Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
