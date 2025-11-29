// src/api/user/userApi.js
import client from "../axiosClient";

// User-only endpoints
export const getUserMembership = () => client.get("/user/membership");
export const updateProfile = (data) => client.put("/user/update", data);
