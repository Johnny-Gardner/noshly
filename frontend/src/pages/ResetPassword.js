import React, { useState } from "react";
import './ResetPassword.css';

// Determine the base URL dynamically
const baseURL = (() => {
    const { hostname } = window.location;
    if (hostname === "127.0.0.1" || hostname === "localhost") {
        return "http://127.0.0.1:5000";
    } else {
        return "https://noshly.onrender.com";
    }
})();

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Email validation pattern
  const isEmailValid = email.match(/\S+@\S+\.\S+/);
  const isFormValid = email && isEmailValid;

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${baseURL}/request_password_reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("If this email exists, a reset link has been sent.");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>
      <p>Enter your email to receive a password reset link.</p>
      <form onSubmit={handleResetRequest} id="reset-form">
        <input
          type="email"
          id="email"
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="reset-button" disabled={!isFormValid}>
          Send Reset Link
        </button>
      </form>
      {message && <div id="success-message" className="success-message">{message}</div>}
      {error && <div id="error-message" className="error-message">{error}</div>}
      <div className="resetPageLinks">
        <a href="/login">Back to Login</a>
      </div>
    </div>
  );
}

export default ResetPassword;
