import React, { useState, useContext } from "react";
import { registerUser, loginUser } from "../../api/auth/userAuth";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function LandingLogin() {
  const [mode, setMode] = useState("login");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const { loginWithToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const sanitizeContactInput = (raw) => raw.replace(/\D/g, "").slice(0, 10);

  const validatePhone = () => contact.length === 10;

  const submit = async (e) => {
    e.preventDefault();
    if (!validatePhone()) return alert("Phone number must be exactly 10 digits");

    setLoading(true);

    if (mode === "register") {
      if (!name.trim()) {
        alert("Name is required for registration");
        setLoading(false);
        return;
      }

      try {
        const res = await registerUser(contact, name.trim());
        loginWithToken(res.data.token, res.data.user);
        navigate("/user/dashboard");
      } catch (err) {
        alert(err.response?.data?.message || "Registration failed");
      } finally {
        setLoading(false);
      }

      return;
    }

    // Login mode
    try {
      const res = await loginUser(contact);
      loginWithToken(res.data.token, res.data.user);
      navigate("/user/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "rgb(64, 26, 19)" }}
    >
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setMode("login")}
            className={`px-5 py-2 rounded-t-lg font-semibold ${
              mode === "login"
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`px-5 py-2 rounded-t-lg font-semibold ml-2 ${
              mode === "register"
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-4">
          <img
            src="/images/cloffylogo.png"
            alt="Cloffy Logo"
            className="w-20 h-20 object-contain"
          />
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {mode === "login" ? "User Login" : "User Register"}
          </h2>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="text-gray-700 font-semibold text-sm">
              Contact Number
            </label>
            <input
              placeholder="Enter phone number"
              value={contact}
              onChange={(e) => setContact(sanitizeContactInput(e.target.value))}
              className="w-full mt-1 p-3 border rounded-lg"
            />
          </div>

          {/* Name (only in register) */}
          {mode === "register" && (
            <div>
              <label className="text-gray-700 font-semibold text-sm">Name</label>
              <input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold bg-yellow-600 text-white"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
