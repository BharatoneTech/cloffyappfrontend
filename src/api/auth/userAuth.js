// src/api/auth/userAuth.js
import client from "../axiosClient";

export const registerUser = (contact_number, name) =>
  client.post("/auth/user/register", { contact_number, name });

export const loginUser = (contact_number) =>
  client.post("/auth/user/login", { contact_number });
