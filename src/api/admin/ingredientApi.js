import client from "../axiosClient";

export const getIngredients = () => client.get("/ingredients");

export const getIngredientById = (id) =>
  client.get(`/ingredients/${id}`);

export const getIngredientsByProduct = (productId) =>
  client.get(`/ingredients/product/${productId}`);

export const createIngredient = (data) =>
  client.post("/ingredients", data);

export const updateIngredient = (id, data) =>
  client.put(`/ingredients/${id}`, data);

export const deleteIngredient = (id) =>
  client.delete(`/ingredients/${id}`);
