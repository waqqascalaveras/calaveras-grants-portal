import React from "react";

export default function UserTypeSelector({ userType, onUserTypeSelect }) {
  return (
    <div className="user-type-selector" style={{ padding: "2rem", maxWidth: 400, margin: "3rem auto", background: "var(--cream)", borderRadius: 4, boxShadow: "none", border: "1px solid var(--stone-gray)" }}>
      <h2 style={{ color: "var(--forest-green)", marginBottom: 24 }}>I am a:</h2>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={() => onUserTypeSelect("county")}
          style={{
            flex: 1,
            padding: "1rem 1.5rem",
            background: userType === "county" ? "var(--moss-green)" : "var(--cream)",
            color: "var(--forest-green)",
            border: `2px solid ${userType === "county" ? 'var(--leaf-green)' : 'var(--stone-gray)'}`,
            borderRadius: 4,
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          🏢 County
        </button>
        <button
          onClick={() => onUserTypeSelect("community")}
          style={{
            flex: 1,
            padding: "1rem 1.5rem",
            background: userType === "community" ? "var(--moss-green)" : "var(--cream)",
            color: "var(--forest-green)",
            border: `2px solid ${userType === "community" ? 'var(--leaf-green)' : 'var(--stone-gray)'}`,
            borderRadius: 4,
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          🤝 CBO
        </button>
      </div>
    </div>
  );
}
