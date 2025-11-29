// src/api/admin/adminApi.js
import client from "../axiosClient";

// Only admin-access endpoints
export const getAllUsers = () => client.get("/admin/users");
export const getAdminStats = () => client.get("/admin/stats");
