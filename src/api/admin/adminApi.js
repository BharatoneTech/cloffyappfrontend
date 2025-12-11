// src/api/admin/adminApi.js
import client from "../axiosClient";

// Admin-only routes
export const getAllUsers = () => client.get("/api/admin/users");
export const getAdminStats = () => client.get("/api/admin/stats");
