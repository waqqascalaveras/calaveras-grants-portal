import React from "react";
import "./UserTypeSelector.css";

export default function UserTypeSelector({ userType, onUserTypeSelect }) {
  const handleSelect = (type) => {
    if (userType === type) {
      onUserTypeSelect('all');
    } else {
      onUserTypeSelect(type);
    }
  };

  return (
    <div className="user-type-toggle">
      <span className="user-type-label">I am:</span>
      <div className="toggle-switch-container" role="group" aria-label="Select audience type">
        <div className="toggle-slider" data-position={userType === "county" ? "left" : userType === "cbo" ? "right" : "none"} />
        <button
          type="button"
          className={`toggle-option ${userType === "county" ? "active" : ""}`}
          onClick={() => handleSelect("county")}
          aria-pressed={userType === "county"}
        >
          <span className="icon" aria-hidden="true">🏢</span> County Dept
        </button>
        <button
          type="button"
          className={`toggle-option ${userType === "cbo" ? "active" : ""}`}
          onClick={() => handleSelect("cbo")}
          aria-pressed={userType === "cbo"}
        >
          <span className="icon" aria-hidden="true">🤝</span> CBO
        </button>
      </div>
    </div>
  );
}
