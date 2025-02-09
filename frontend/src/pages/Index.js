import React from "react";
import './Index.css';
import { useNavigate } from "react-router-dom";

const IndexPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
      <div className="index-container">
          {/* Login Button in Header */}
          <div className="top-bar">
              <img src="/images/noshly_logo.png" alt="Noshly" className="index-logo"/>
              <button onClick={handleLoginClick} className="login-button">
                  Log in
              </button>
          </div>

          {/* Main Content Centered */}
          <div className="index-content">
              <h1>Welcome to Noshly.</h1>
              <p>Generate meal plans in minutes.</p>
              <button onClick={handleRegisterClick} className="get-started-button">
                  Get started
              </button>
          </div>
      </div>
  );
};

export default IndexPage;
