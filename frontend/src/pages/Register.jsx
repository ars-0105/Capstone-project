import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./Login.css";

export default function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [currency, setCurrency] = useState("INR");

  const [error, setError] = useState("");

  async function submit(e) {
  e.preventDefault();
  setError("");

  // basic required-field check
  if (!name || !email || !password || !currency) {
    setError("Please fill in all fields.");
    return;
  }

  try {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      currency,
    });
    const userData = data.user;
    localStorage.setItem('user', JSON.stringify(userData)); // ✅ Persist user in localStorage
    onRegister(userData); // ✅ Update state in App.jsx
  } catch (err) {
    setError(err.response?.data?.message || "Register failed");
  }
}

  return (
    <div className="center-page">
      <div className="auth-card">
        <h1 className="title">Create account ✨</h1>
        <form onSubmit={submit}>
          <input
            className="input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* password with eye-toggle */}
          <div style={{ position: "relative" }}>
            <input
              className="input"
              placeholder="Password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: 8,
                top: 8,
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {show ? "🙈" : "👁️"}
            </button>
          </div>

          {/* currency selector */}
          <select
            className="input"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>

          <button className="button" type="submit">
            Sign up
          </button>
        </form>

        {/* error display */}
        {error && (
          <p style={{ color: "salmon", marginTop: "0.5rem" }}>{error}</p>
        )}

        <Link className="link" to="/login">
          Have an account? Log in →
        </Link>
      </div>
    </div>
  );
}
