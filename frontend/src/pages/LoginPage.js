// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './LoginPage.css';

// Determine the base URL dynamically
const baseURL = (() => {
    const { hostname } = window.location;
    if (hostname === "127.0.0.1" || hostname === "localhost") {
        return "http://127.0.0.1:5000";
    } else if (hostname.includes("johnnygardner.co.uk")) {
        return "https://www.johnnygardner.co.uk";
    } else {
        return "https://noshly.onrender.com";
    }
})();

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email validation pattern
  const isEmailValid = email.match(/\S+@\S+\.\S+/);
  const isFormValid = email && password && isEmailValid;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("authToken", data.token); // Save token in localStorage
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Login failed.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} id="login-form">
        <input
          type="email"
          id="email"
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          id="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="button" disabled={!isFormValid}>
          Login
        </button>
      </form>
      {error && <div id="error-message" className="error-message">{error}</div>}
      <div className="loginPageLinks">
        <a href="/resetpassword">Forgot Password?</a>
        <a href="/register">Sign Up</a>
      </div>
    </div>
  );
}

export default LoginPage;
