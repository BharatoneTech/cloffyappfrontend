// src/api/auth/userAuth.js
import client from "../axiosClient";

export const userLoginOrRegister = (contact_number, name) =>
  client.post("/auth/user/login", { contact_number, name });
