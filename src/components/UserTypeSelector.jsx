import React from "react";

const USER_TYPES = [
  {
    key: "county",
    label: "County Department",
    description: "Internal Staff",
    icon: "🏢"
  },
  {
    key: "community",
    label: "Community Organization",
    description: "Nonprofit, CBO, etc.",
    icon: "🤝"
  }
];

export default function UserTypeSelector({ userType, onUserTypeSelect }) {
  return (
    <div className="user-type-selector" style={{ padding: "2rem", maxWidth: 480, margin: "3rem auto", background: "var(--cream)", borderRadius: 4, boxShadow: "none", border: "1px solid var(--stone-gray)" }}>
      <h2 style={{ color: "var(--forest-green)", marginBottom: 24 }}>I am a:</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {USER_TYPES.map(type => (
          <button
            key={type.key}
            onClick={() => onUserTypeSelect(type.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "1.25rem 1.5rem",
              background: userType === type.key ? "var(--moss-green)" : "var(--cream)",
              color: "var(--forest-green)",
              border: `2px solid ${userType === type.key ? 'var(--leaf-green)' : 'var(--stone-gray)'}`,
              borderRadius: 4,
              fontSize: 20,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s, border 0.2s"
            }}
          >
            <span style={{ fontSize: 28 }}>{type.icon}</span>
            <span>
              {type.label}
              <div style={{ fontSize: 14, color: "var(--bark-brown)", fontWeight: 400 }}>{type.description}</div>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
