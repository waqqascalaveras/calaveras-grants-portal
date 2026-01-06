import React from "react";
import "./UserTypeSelector.css";

export default function UserTypeSelector({ userType, onUserTypeSelect }) {
  return (
    <div className="user-type-toggle">
      <span className="user-type-label">I am:</span>
      <div className="user-type-pill" role="group" aria-label="Select audience type">
        <button
          type="button"
          className={`user-type-option ${userType === "county" ? "active" : ""}`}
          onClick={() => onUserTypeSelect("county")}
          aria-pressed={userType === "county"}
        >
          <span className="icon" aria-hidden="true">🏢</span> County Dept
        </button>
        <button
          type="button"
          className={`user-type-option ${userType === "cbo" ? "active" : ""}`}
          onClick={() => onUserTypeSelect("cbo")}
          aria-pressed={userType === "cbo"}
        >
          <span className="icon" aria-hidden="true">🤝</span> CBO
        </button>
      </div>
    </div>
  );
}
