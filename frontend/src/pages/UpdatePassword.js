import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UpdatePassword.css";

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

function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the token from the URL
  const token = new URLSearchParams(location.search).get("token");

  // Form validation
  const isFormValid = password && confirmPassword && password.length >= 8 && password === confirmPassword;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${baseURL}/update_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (response.ok) {
        setSuccess("Password updated successfully. Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update password.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="update-container">
      <h2>Reset Your Password</h2>
      <form onSubmit={handleUpdatePassword} id="update-form">
        <input
          type="password"
          className="input-field"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="update-button" disabled={!isFormValid}>
          Update Password
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <div className="updatePageLinks">
        <a href="/login">Back to Login</a>
      </div>
    </div>
  );
}

export default UpdatePassword;
