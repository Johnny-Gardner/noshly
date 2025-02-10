import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define baseURL dynamically
const baseURL = (() => {
  const { hostname } = window.location;
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "http://127.0.0.1:5000";
  } else {
    return "https://noshly.onrender.com";
  }
})();

const AdminPortal = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        // No token, redirect to login page
        navigate("/login");
        return;
      }

      try {
        // Decode the token to get user role
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT
        const userRole = decodedToken.role;

        if (userRole !== "admin") {
          // If the user is not an admin, redirect to dashboard
          navigate("/dashboard");
          return;
        }

        // Fetch data if the user is an admin
        const response = await fetch(`${baseURL}/admin`, {
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

    checkAccess();
  }, [navigate]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Admin Portal</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default AdminPortal;
