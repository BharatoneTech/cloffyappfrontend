import client from "../axiosClient";

export const fetchCategories = () => client.get("/categories/active/list");
