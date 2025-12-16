// src/api/admin/productApi.js
import client from "../axiosClient";

export const getProducts = () => client.get("/products");

export const getProductById = (id) =>
  client.get(`/products/${id}`);

export const getProductsByCategory = (categoryId) =>
  client.get(`/products/category/${categoryId}`);

export const createProduct = (formData) =>
  client.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProduct = (id, formData) =>
  client.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProduct = (id) =>
  client.delete(`/products/${id}`);

// NEW: Bulk update status by category
export const bulkUpdateCategoryStatus = (categoryId, status) =>
  client.put(`/products/category/${categoryId}/status`, { status });
