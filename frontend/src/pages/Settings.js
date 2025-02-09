import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define baseURL dynamically
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

const Settings = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettingsData = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");  // Redirect to login if there's no token
        return;
      }

      try {
        const response = await fetch(`${baseURL}/settings`, {  // Use baseURL dynamically
          headers: {
            "Authorization": `Bearer ${token}`, // Send token in the request
          },
        });

        if (!response.ok) {
          throw new Error("Unauthorized"); // If not authorized, handle the error
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError("You are not authorized to access this page.");
        navigate("/login");  // Redirect to login if there's an error (invalid token)
      }
    };

    fetchSettingsData();
  }, [navigate]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Settings</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Settings;
