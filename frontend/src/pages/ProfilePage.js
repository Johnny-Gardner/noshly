/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext  } from "react-router-dom";
import "./ProfilePage.css"; // Profile-specific styles

const baseURL = (() => {
  const { hostname } = window.location;
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "http://127.0.0.1:5000";
  } else {
    return "https://noshly.onrender.com";
  }
})();

const countries = ["United Kingdom", "United States", "Canada", "Australia", "Germany", "France", "India", "Japan"];

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [deletionError, setDeletionError] = useState("");
  const [deletionSuccess, setDeletionSuccess] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [country, setCountry] = useState(profileData?.country);
  const [adults, setAdults] = useState(profileData?.adults || 1);
  const [children, setChildren] = useState(profileData?.children || 0);
  const [allergies, setAllergies] = useState([]);
  const [dietary_preferences, setDietaryPreferences] = useState([]);
  const [days, setDays] = useState(profileData?.plan_days || 1);
  const [selectedOptions, setSelectedOptions] = useState({
  allergies: [],
  dietary_preferences: []
});
  const navigate = useNavigate();
  const { updateFirstName } = useOutletContext();

  const options = [
  { type: "allergy", name: "Peanuts", emoji: "🥜" },
  { type: "allergy", name: "Tree Nuts", emoji: "🌰" },
  { type: "allergy", name: "Dairy", emoji: "🥛" },
  { type: "allergy", name: "Eggs", emoji: "🍳" },
  { type: "allergy", name: "Shellfish", emoji: "🦐" },
  { type: "allergy", name: "Fish", emoji: "🐟" },
  { type: "allergy", name: "Wheat", emoji: "🌾" },
  { type: "allergy", name: "Gluten", emoji: "🍞" },
  { type: "allergy", name: "Soy", emoji: "🌱" },
  { type: "allergy", name: "Sesame", emoji: "⚪" },
  { type: "dietary", name: "Vegetarian", emoji: "🥗" },
  { type: "dietary", name: "Vegan", emoji: "🌿" },
  { type: "dietary", name: "Keto", emoji: "🥓" },
  { type: "dietary", name: "High-Protein", emoji: "🍗" },
  { type: "dietary", name: "Pescatarian", emoji: "🐟" },
  { type: "dietary", name: "Low-Carb", emoji: "🥩" },
  { type: "dietary", name: "Flexitarian", emoji: "🌎" },
  { type: "dietary", name: "Sustainable", emoji: "💚" },
  { type: "dietary", name: "Halal", emoji: "🕌" },
  { type: "dietary", name: "Kosher", emoji: "✡️" },
  { type: "dietary", name: "Hindu Veg", emoji: "🛕" },
  { type: "dietary", name: "Buddhist Veg", emoji: "☸️" },
  ]

  const handleCheckboxChange = (category, value) => {
  setSelectedOptions(prevState => {
    const newCategory = prevState[category].includes(value)
      ? prevState[category].filter(item => item !== value)
      : [...prevState[category], value];

    // Update the relevant state (allergies or dietaryPreferences)
    if (category === "allergies") {
      setAllergies(newCategory); // Update the allergies state
    } else if (category === "dietary_preferences") {
      setDietaryPreferences(newCategory); // Update the dietaryPreferences state
    }

    return {
      ...prevState,
      [category]: newCategory
    };
  });
};

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${baseURL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const result = await response.json();
        setProfileData(result);
        setSelectedOptions({
        allergies: result.allergies || [],
        dietary_preferences: result.dietary_preferences || [],
      });
        setCountry(result.country);
        setDays(result.plan_days);
        setAdults(result.adults);
        setChildren(result.children);

      } catch (error) {
        setError("You are not authorized to access this page.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;

  if (type === "checkbox") {
    // Handle checkboxes
    setProfileData(prevState => {
      const updatedOptions = checked
        ? [...prevState[name], value]
        : prevState[name].filter((item) => item !== value);
      return {
        ...prevState,
        [name]: updatedOptions,
      };
    });
  } else if (type === "number") {
    // Handle number inputs
    setProfileData(prevState => ({
      ...prevState,
      [name]: Math.max(1, Number(value)),  // Ensure the value is at least 1 or 0 for children
    }));
  } else {
    // Handle other inputs (e.g., text, select)
    setProfileData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }
};

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${baseURL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      setSuccess(result.message);
      setError(null);
      // Update the user's first name in the Topbar
      if (profileData.firstname) {
        updateFirstName(profileData.firstname);
      }

    } catch (error) {
      setError("Error updating profile. Please try again.");
      setSuccess("");
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${baseURL}/delete_account`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      // Success message
      const result = await response.json();
      setDeletionSuccess(result.message);
      setDeletionError(null);

      // Logout after account deletion
      localStorage.removeItem("authToken");
      navigate("/login");
    } catch (error) {
      setDeletionError("Error deleting account. Please try again.");
      setDeletionSuccess("");
    }
  };

  const handleShowDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-header">Your Profile</h1>
      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}
      <form>
        <div className="form-group">
          <label htmlFor="firstname">First Name:</label>
          <input
              type="text"
              id="firstname"
              name="firstname"
              value={profileData?.firstname || ""}
              onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastname">Last Name:</label>
          <input
              type="text"
              id="lastname"
              name="lastname"
              value={profileData?.lastname || ""}
              onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email (Read-only):</label>
          <input
              type="text"
              id="email"
              name="email"
              value={profileData?.email || ""}
              readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="country">Country:</label>
          <select
              className="input-field select-field"
              name="country"  // Set name to reference profileData
              value={profileData?.country || ""}
              onChange={handleInputChange}
              required
          >
            <option value="">Select your country</option>
            {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Adults:</label>
          <div className="number-input">
            <button type="button"
                    onClick={() => setProfileData(prev => ({...prev, adults: Math.max(1, prev.adults - 1)}))}>-
            </button>
            <input
                type="number"
                name="adults"
                value={profileData?.adults || 1}
                onChange={handleInputChange}
                min="1"
            />
            <button type="button"
                    onClick={() => setProfileData(prev => ({...prev, adults: Math.min(10, prev.adults + 1)}))}>+
            </button>
          </div>

          <label>Children:</label>
          <div className="number-input">
            <button type="button"
                    onClick={() => setProfileData(prev => ({...prev, children: Math.max(0, prev.children - 1)}))}>-
            </button>
            <input
                type="number"
                name="children"
                value={profileData?.children || 0}
                onChange={handleInputChange}
                min="0"
            />
            <button type="button" onClick={() => setProfileData(prev => ({...prev, children: prev.children + 1}))}>+
            </button>
          </div>
        </div>
        <div className="form-group checkbox-group">
          <label className="checkbox-label">Allergies (optional):</label>
          <div className="checkbox-options">
            {options
                .filter(option => option.type === "allergy")
                .map(option => (
                    <label key={option.name} className="checkbox-item">
                      <input
                          type="checkbox"
                          name="allergies"
                          value={option.name}
                          checked={profileData?.allergies.includes(option.name)}
                          onChange={handleInputChange}
                      />
                      <span className="custom-checkbox"></span>
                      <span className="emoji">{option.emoji}</span> {option.name}
                    </label>
                ))}
          </div>
        </div>
        <div className="form-group checkbox-group">
          <label className="checkbox-label">Dietary Preferences (optional):</label>
          <div className="checkbox-options">
            {options
                .filter(option => option.type === "dietary")
                .map(option => (
                    <label key={option.name} className="checkbox-item">
                      <input
                          type="checkbox"
                          name="dietary_preferences"
                          value={option.name}
                          checked={profileData?.dietary_preferences.includes(option.name)}
                          onChange={handleInputChange}
                      />
                      <span className="custom-checkbox"></span>
                      <span className="emoji">{option.emoji}</span> {option.name}
                    </label>
                ))}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="plan_days">Plan Days:</label>
          <div className="number-input">
            <button
                type="button"
                onClick={() => setProfileData(prev => ({...prev, plan_days: Math.max(1, prev.plan_days - 1)}))}
            >
              -
            </button>
            <input
                type="number"
                name="plan_days"
                value={profileData?.plan_days || 1}
                onChange={handleInputChange}
                min="1"
                max="7"
                required
            />
            <button
                type="button"
                onClick={() => setProfileData(prev => ({...prev, plan_days: Math.min(7, prev.plan_days + 1)}))}
            >
              +
            </button>
          </div>
        </div>
        <div className="button-container">
          <button type="button" className="button-next" onClick={handleSave}>
            Update
          </button>
        </div>
      </form>
      {/* Delete Account Section */}
      <div className="delete-account-container">
        <h2>Delete Your Account</h2>
        {deletionSuccess && <p className="success-message">{deletionSuccess}</p>}
        {deletionError && <p className="error-message">{deletionError}</p>}
        <button
            className="button delete-account-button"
            onClick={handleShowDeleteConfirmation}
        >
          Delete Account
        </button>
        <p className="warning-text">
          Warning: Deleting your account is permanent and cannot be undone.
        </p>
      </div>
      {/* Confirmation Pop-up */}
      {showDeleteConfirmation && (
          <div className="confirmation-popup">
          <div className="confirmation-content">
              <h3>Are you sure you want to delete your account?</h3>
              <p>This action cannot be undone.</p>
              <div className="confirmation-buttons">
                <button className="button confirm-button" onClick={handleDeleteAccount}>
                  Yes, Delete Account
                </button>
                <button className="button cancel-button" onClick={handleCancelDelete}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
      )}

    </div>
  );
};

export default Profile;
