import client from "../axiosClient";

export const getCategories = () => client.get("/categories");
export const getCategoryById = (id) => client.get(`/categories/${id}`);

export const createCategory = (formData) =>
  client.post("/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateCategory = (id, formData) =>
  client.put(`/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteCategory = (id) => client.delete(`/categories/${id}`);


export const inactivateAllCategories = () =>
  client.put("/categories/inactivate/all");

export const activateAllCategories = () =>
  client.put("/categories/activate/all");