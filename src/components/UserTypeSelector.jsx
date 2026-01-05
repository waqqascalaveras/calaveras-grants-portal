import React from "react";

export default function UserTypeSelector({ userType, onUserTypeSelect }) {
  const buttonStyle = (isActive) => ({
    padding: "0.6rem 1.2rem",
    background: isActive ? "var(--forest-green)" : "white",
    color: isActive ? "white" : "var(--forest-green)",
    border: `2px solid ${isActive ? 'var(--forest-green)' : '#d1d5db'}`,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: isActive ? 600 : 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
    opacity: isActive ? 1 : 0.7,
    transform: isActive ? "scale(1.02)" : "scale(1)"
  });

  return (
    <div className="user-type-toggle" style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <span style={{ fontSize: 14, color: "var(--forest-green)", fontWeight: 500 }}>I am:</span>
      <button
        onClick={() => onUserTypeSelect("county")}
        style={buttonStyle(userType === "county")}
        onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = userType === "county" ? "scale(1.02)" : "scale(1)")}
      >
        🏢 County Dept
      </button>
      <button
        onClick={() => onUserTypeSelect("cbo")}
        style={buttonStyle(userType === "cbo")}
        onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = userType === "cbo" ? "scale(1.02)" : "scale(1)")}
      >
        🤝 CBO
      </button>
    </div>
  );
}
