import client from "../axiosClient";

export const fetchAdditionalIngredients = () =>
  client.get("/additional-ingredients");
