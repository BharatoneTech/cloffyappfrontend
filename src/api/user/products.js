import client from "../axiosClient";

export const fetchProducts = () => client.get("/products/active");

export const fetchProductsByCategory = (categoryId) =>
  client.get(`/products/category/${categoryId}`);

export const fetchProductById = (id) =>
  client.get(`/products/active/${id}`);
