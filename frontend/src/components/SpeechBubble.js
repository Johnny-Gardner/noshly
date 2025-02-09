import React, { useState, useEffect, useRef } from "react";
import "./SpeechBubble.css"; // Import the CSS for styling

const SpeechBubble = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const textRef = useRef("");

  // Animate the text letter by letter
  useEffect(() => {
    let i = 0;
    setDisplayText(""); // Reset text display when text changes
    textRef.current = ""; // Reset the textRef when the input text changes

    const interval = setInterval(() => {
      if (i < text.length) {
        textRef.current += text.charAt(i); // Append each character
        setDisplayText(textRef.current); // Update the displayText state
        i += 1;
      }

      if (i === text.length) {
        clearInterval(interval);
      }
    }, 10); // Adjust the typing speed

    return () => clearInterval(interval); // Cleanup the interval when component unmounts or changes
  }, [text]); // Re-run the effect if the 'text' prop changes

  return (
    <div className="speech-bubble">
      <div className="bubble">
        <p>{displayText}</p>
      </div>
    </div>
  );
};

export default SpeechBubble;
