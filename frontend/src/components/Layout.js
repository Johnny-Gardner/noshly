import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";  // Import useNavigate here
import { jwtDecode } from "jwt-decode";
import "./Layout.css";

const Layout = () => {
  const [userFirstName, setUserFirstName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();  // Initialize navigate here

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = (e) => {
    if (!e.target.closest(".profile")) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", closeDropdown);
    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserFirstName(decodedToken.firstname);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem("authToken"); // Remove token from localStorage
    setUserFirstName(null); // Clear the user's first name
    navigate("/login"); // Redirect to login page (or homepage if you prefer)
     setTimeout(() => {
      navigate("/login"); // Redirect to login page
    }, 100); // Delay to allow state to be cleared
  };

  // Function to update the user's first name
  const updateFirstName = (newFirstName) => {
    setUserFirstName(newFirstName);
  };

  return (
    <div>
      <header className="header">
        <div className="logo">SaaS Template</div>
        <nav>
          <div className="profile" onClick={toggleDropdown}>
            <span>{userFirstName}</span>
            <img
              src="/images/profile_image.jpg"
              alt="Profile"
            />
            <div className={`dropdown ${isDropdownOpen ? "open" : ""}`}>
              <ul>
                <li><NavLink to="/profile">My Profile</NavLink></li>
                {userRole === "admin" && (<li><NavLink to="/adminportal">Admin Portal</NavLink></li>)}
                <li><NavLink to="#" onClick={logout} className="dropdown-item">Logout</NavLink></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <div className="container">
        <aside className="sidebar">
          <ul>
            <li><NavLink to="/dashboard">Dashboard</NavLink></li>
            <li><NavLink to="/analytics">Analytics</NavLink></li>
            <li><NavLink to="/settings">Settings</NavLink></li>
          </ul>
        </aside>
        <main className="content">
          <Outlet context={{ updateFirstName }}/>
        </main>
      </div>
    </div>
  );
};

export default Layout;
