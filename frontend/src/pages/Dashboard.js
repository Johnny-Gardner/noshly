import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

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

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");  // Redirect to login if there's no token
        return;
      }

      try {
        const response = await fetch(`${baseURL}/dashboard`, {  // Use baseURL dynamically
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

    fetchDashboardData();
  }, [navigate]);

  const handleGenerateMealPlan = async () => {
    setLoading(true);
    setMealPlan(null);
    setError(null);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to generate a meal plan.");
      return;
    }

    try {
      const response = await fetch(`${baseURL}/generateMealPlan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate meal plan.");
      }

      const result = await response.json();
      setMealPlan(result);
    } catch (error) {
      setError("An error occurred while generating the meal plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div>
        <h1>Dashboard</h1>
        {error && <p style={{color: "red"}}>{error}</p>}

        {/* Display Dashboard Data */}
        <pre>{JSON.stringify(data, null, 2)}</pre>

        {/* Generate Meal Plan Button */}
        <button onClick={handleGenerateMealPlan} disabled={loading}>
          {loading ? "Generating..." : "Generate Meal Plan"}
        </button>

        {/* Display Meal Plan */}
        {mealPlan && mealPlan.plan && (
            <div>
              <h2>Generated Meal Plan</h2>
              {/* Render meal plan content using ReactMarkdown */}
              <ReactMarkdown>{mealPlan.plan}</ReactMarkdown>
            </div>
        )}
      </div>
  );
};

export default Dashboard;
