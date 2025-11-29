import React, { useState, useContext } from "react";
import { userLoginOrRegister } from "../../api/auth/userAuth";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function LandingLogin() {
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const { loginWithToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await userLoginOrRegister(contact, name);
      loginWithToken(res.data.token, res.data.user);
      navigate("/user/dashboard");
    } catch (err) {
      alert("User login failed");
    }
  };

  return (
    <div>
      <h2>User Login</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Contact Number"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <input
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Continue</button>
      </form>
    </div>
  );
}
