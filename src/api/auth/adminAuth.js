// src/api/auth/adminAuth.js
import client from "../axiosClient";

export const adminLogin = (username, password) =>
  client.post("/auth/admin/login", { username, password });
