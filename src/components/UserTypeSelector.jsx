import React from "react";

export default function UserTypeSelector({ userType, onUserTypeSelect }) {
  return (
    <div className="user-type-toggle" style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 14, color: "var(--forest-green)", fontWeight: 500 }}>I am:</span>
      <button
        onClick={() => onUserTypeSelect("county")}
        style={{
          padding: "0.5rem 1rem",
          background: userType === "county" ? "var(--moss-green)" : "var(--cream)",
          color: "var(--forest-green)",
          border: `2px solid ${userType === "county" ? 'var(--leaf-green)' : 'var(--stone-gray)'}`,
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        🏢 County Dept
      </button>
      <button
        onClick={() => onUserTypeSelect("cbo")}
        style={{
          padding: "0.5rem 1rem",
          background: userType === "cbo" ? "var(--moss-green)" : "var(--cream)",
          color: "var(--forest-green)",
          border: `2px solid ${userType === "cbo" ? 'var(--leaf-green)' : 'var(--stone-gray)'}`,
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        🤝 CBO
      </button>
    </div>
  );
}
