import React, { useState, useContext } from "react";
import { adminLogin } from "../../api/auth/adminAuth";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await adminLogin(username, password);
      loginWithToken(res.data.token, res.data.user);
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Admin login failed");
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Admin Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default AdminLogin;
