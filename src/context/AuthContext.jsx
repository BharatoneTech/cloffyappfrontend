// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { getMe } from "../api/auth/token";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    user: null,
    loading: true,
  });

  // Load user on refresh
  useEffect(() => {
    const init = async () => {
      if (!auth.token) {
        setAuth({ token: null, user: null, loading: false });
        return;
      }

      try {
        const res = await getMe();
        setAuth({ token: auth.token, user: res.data, loading: false });
      } catch {
        localStorage.removeItem("token");
        setAuth({ token: null, user: null, loading: false });
      }
    };

    init();
  }, []);

  const loginWithToken = (token, user) => {
    localStorage.setItem("token", token);
    setAuth({ token, user, loading: false });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ token: null, user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...auth, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
