// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { getMe } from "../api/auth/token";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user") || "null"),
    loading: true,
  });

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = JSON.parse(localStorage.getItem("user") || "null");

      // If token or user missing => logout state
      if (!savedToken || !savedUser) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuth({ token: null, user: null, loading: false });
        return;
      }

      try {
        const res = await getMe();
        const apiData = res.data;

        const user =
          apiData.user ||
          apiData.admin ||
          apiData.data?.user ||
          apiData.data?.admin ||
          apiData.data ||
          null;

        if (!user) throw new Error("Invalid user data from /auth/me");

        localStorage.setItem("user", JSON.stringify(user));

        setAuth({
          token: savedToken,
          user,
          loading: false,
        });
      } catch (err) {
        console.error("AUTH ERROR:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuth({ token: null, user: null, loading: false });
      }
    };

    init();
  }, []);

  const loginWithToken = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setAuth({
      token,
      user,
      loading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...auth, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
