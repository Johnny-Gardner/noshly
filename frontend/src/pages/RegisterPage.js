import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import SpeechBubble from "../components/SpeechBubble";

const baseURL = (() => {
  const { hostname } = window.location;
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "http://127.0.0.1:5000";
  } else if (hostname.includes("johnnygardner.co.uk")) {
    return "https://www.johnnygardner.co.uk";
  } else {
    return "https://saas-application.onrender.com";
  }
})();

const countries = ["United Kingdom", "United States", "Canada", "Australia", "Germany", "France", "India", "Japan"];

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [country, setCountry] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [allergies, setAllergies] = useState([]);
  const [dietary_preferences, setDietaryPreferences] = useState([]);
  const [days, setDays] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({
  allergies: [],
  dietaryPreferences: []
});
  const navigate = useNavigate();

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
];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Password Confirmation Validation
    if (password !== passwordConfirm) {
      setError("Passwords do not match!");
      return; // Stop form submission
    }

    try {
      const response = await fetch(`${baseURL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstname, lastname, email, password, country, adults, children, allergies, dietary_preferences, days }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("authToken", data.token);
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Registration failed.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };


const handleCheckboxChange = (category, value) => {
  setSelectedOptions(prevState => {
    const newCategory = prevState[category].includes(value)
      ? prevState[category].filter(item => item !== value)
      : [...prevState[category], value];

    // Update the relevant state (allergies or dietaryPreferences)
    if (category === "allergies") {
      setAllergies(newCategory); // Update the allergies state
    } else if (category === "dietaryPreferences") {
      setDietaryPreferences(newCategory); // Update the dietaryPreferences state
    }

    return {
      ...prevState,
      [category]: newCategory
    };
  });
};

  // Function to handle back navigation
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Calculate progress percentage
  const progress = ((step - 1) / 5) * 100;

  return (
    <>
      {/* Progress bar and Back arrow outside register container */}
      <div className="progress-bar-container">
        {/* Back Arrow */}
        {step > 1 && (
          <div className="back-arrow-container">
            <button className="back-arrow-button" onClick={handleBack}>
              <svg
                viewBox="0 0 44 44"
                focusable="false"
                className="back-arrow"
                data-testid="back-arrow"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17 21.9571L24.9571 29.9142L26.3713 28.5L19.8284 21.9571L26.3713 15.4142L24.9571 14L17 21.9571Z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Main Register Form */}
      <div className="register-container">
        <div className="form-content">
          <div className="speech-bubble-container">
            {step === 1 && <SpeechBubble text="Please select a country:"/>}
            {step === 2 && <SpeechBubble text="Please select family size:"/>}
            {step === 3 && <SpeechBubble text="Please select your allergies:"/>}
            {step === 4 && <SpeechBubble text="Please select your dietary preferences:"/>}
            {step === 5 && <SpeechBubble text="Please select number of meals per week:"/>}
            {step === 6 && <SpeechBubble text="Your meal plan is ready. Create a free account for a life of easy meal planning."/>}
          </div>
          {/* Step Content */}
          {/* Step 1: Country Selection */}
          {step === 1 && (
              <div className="step-container">
                <select
                    className="input-field select-field"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
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
          )}

          {/* Step 2: Family Details */}
          {step === 2 && (
              <div className="step-container">
                <div className="family-size-group">
                  <label>Adults:</label>
                  <div className="number-input">
                    <button onClick={() => setAdults(adults > 1 ? adults - 1 : 1)}>-</button>
                    <input type="number" value={adults} onChange={(e) => setAdults(Math.max(1, e.target.value))} min="1"
                           required/>
                    <button onClick={() => setAdults(adults + 1)}>+</button>
                  </div>
                </div>

                <div className="family-size-group">
                  <label>Children:</label>
                  <div className="number-input">
                    <button onClick={() => setChildren(children > 0 ? children - 1 : 0)}>-</button>
                    <input type="number" value={children} onChange={(e) => setChildren(Math.max(0, e.target.value))}
                           min="0" required/>
                    <button onClick={() => setChildren(children + 1)}>+</button>
                  </div>
                </div>
              </div>
          )}

          {/* Step 3: Allergies Selection */}
          {step === 3 && (
              <div className="step-container checkbox-group">
                <div className="checkbox-options">
                  {options
                      .filter(option => option.type === "allergy")
                      .map(option => (
                          <label key={option.name} className="checkbox-item">
                            <input
                                type="checkbox"
                                value={option.name}
                                checked={allergies.includes(option.name)}
                                onChange={() => handleCheckboxChange("allergies", option.name)}
                            />
                            <span className="custom-checkbox"></span>
                            <span className="emoji">{option.emoji}</span> {option.name}
                          </label>
                      ))}
                </div>
              </div>
          )}

          {/* Step 4: Dietary Preferences Selection */}
          {step === 4 && (
              <div className="step-container checkbox-group">
                <div className="checkbox-options">
                  {options
                      .filter(option => option.type === "dietary")
                      .map(option => (
                          <label key={option.name} className="checkbox-item">
                            <input
                                type="checkbox"
                                value={option.name}
                                checked={dietary_preferences.includes(option.name)}
                                onChange={() => handleCheckboxChange("dietaryPreferences", option.name)}
                            />
                            <span className="custom-checkbox"></span>
                            <span className="emoji">{option.emoji}</span> {option.name}
                          </label>
                      ))}
                </div>
              </div>
          )}

          {/* Step 5: Meal Plan Duration */}
          {step === 5 && (
              <div className="step-container">
                <div className="number-input">
                  <button onClick={() => setDays(days > 1 ? days - 1 : 1)}>-</button>
                  <input type="number" value={days} onChange={(e) => setDays(Math.max(1, e.target.value))} min="1"
                         max="7" required/>
                  <button onClick={() => setDays(days < 7 ? days + 1 : 7)}>+</button>
                </div>
              </div>
          )}

          {/* Step 6: User Information */}
          {step === 6 && (
              <div className="step-container">
                <form onSubmit={handleRegister} id="register-form">
                  <input
                      type="text"
                      className="input-field"
                      placeholder="First Name"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      required
                  />
                  <input
                      type="text"
                      className="input-field"
                      placeholder="Last Name"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      required
                  />
                  <input
                      type="email"
                      className="input-field"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                  />
                  <input
                      type="password"
                      className="input-field"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                  />
                  <input
                      type="password"
                      className="input-field"
                      placeholder="Confirm Password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                  />
                </form>
              </div>
          )}

          {/* Next/Submit Button */}
          <div className="form-actions-container">
            <div className="form-actions">
              {step !== 6 && (
                  <button className="button-continue" onClick={() => country && setStep(step + 1)} disabled={!country} >
                    Continue
                  </button>
              )}
              {step === 6 && (
                  <button type="submit" className="button-continue" onClick={handleRegister}>
                    Register
                  </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && <div id="error-message" className="error-message">{error}</div>}

          {/* Links to Login Page */}
          <div className="links">
            <a href="/login">Already have an account? Login</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
