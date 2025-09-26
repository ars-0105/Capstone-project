import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
  e.preventDefault();
  setError("");

  // basic validation
  if (!email || !password) {
    setError("Please enter both email and password.");
    return;
  }

  try {
    const { data } = await api.post("/auth/login", { email, password });
    const userData = data.user;
    localStorage.setItem('user', JSON.stringify(userData)); // ✅ Persist user in localStorage
    onLogin(userData); // ✅ Update state in App.jsx
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  }
}


  return (
    <div className="center-page">
      <div className="auth-card">
        <h1 className="title">Welcome back 👋</h1>
        <form onSubmit={submit}>
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

          <button className="button" type="submit">
            Login
          </button>
        </form>

        {/* error feedback */}
        {error && (
          <p style={{ color: "salmon", marginTop: "0.5rem" }}>{error}</p>
        )}

        <Link className="link" to="/register">
          No account? Sign up →
        </Link>
      </div>
    </div>
  );
}
