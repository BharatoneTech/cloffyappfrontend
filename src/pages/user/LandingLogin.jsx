// src/pages/user/LandingLogin.jsx
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "rgb(64, 26, 19)" }} // Same as Admin UI
    >
      {/* Login Card */}
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/images/cloffylogo.png"
            alt="Cloffy Logo"
            className="w-28 h-28 object-contain"
          />
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            User Login
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">

          <div>
            <label className="text-gray-700 font-semibold text-sm">
              Contact Number
            </label>
            <input
              placeholder="Enter phone number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
            />
          </div>

          <div>
            <label className="text-gray-700 font-semibold text-sm">
              Name (optional)
            </label>
            <input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold bg-yellow-600 hover:bg-yellow-700 text-white transition"
          >
            Continue
          </button>
        </form>

      </div>
    </div>
  );
}
