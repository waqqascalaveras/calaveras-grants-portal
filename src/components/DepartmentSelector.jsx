import React from "react";

const DEPARTMENTS = [
  { key: "public_health", label: "Public Health", icon: "🏥" },
  { key: "social_services", label: "Social Services", icon: "🤝" },
  { key: "public_works", label: "Public Works", icon: "🏗️" },
  { key: "planning_building", label: "Planning & Building", icon: "📐" },
  { key: "sheriff_emergency", label: "Sheriff / Emergency Services", icon: "🚓" },
  { key: "environmental_health", label: "Environmental Health", icon: "🌲" },
  { key: "parks_recreation", label: "Parks & Recreation", icon: "🏞️" },
  { key: "education_workforce", label: "Education & Workforce", icon: "🎓" },
  { key: "agriculture", label: "Agriculture", icon: "🌾" },
  { key: "it_data", label: "IT & Data Modernization", icon: "💻" }
];

const COMMUNITY_TYPES = [
  { key: "nonprofit", label: "Nonprofit", icon: "🏢" },
  { key: "community_group", label: "Community Group", icon: "👥" },
  { key: "faith_based", label: "Faith-Based Org", icon: "⛪" },
  { key: "education", label: "Educational Institution", icon: "🏫" },
  { key: "tribal", label: "Tribal Organization", icon: "🪶" }
];

export default function DepartmentSelector({ userType, subType, onSubTypeSelect }) {
  const options = userType === "county" ? DEPARTMENTS : COMMUNITY_TYPES;
  return (
    <div className="department-selector" style={{ padding: "2rem", maxWidth: 480, margin: "3rem auto", background: "var(--cream)", borderRadius: 4, boxShadow: "none", border: "1px solid var(--stone-gray)" }}>
      <h2 style={{ color: "var(--forest-green)", marginBottom: 24 }}>
        {userType === "county" ? "Select Your County Department" : "Select Your Organization Type"}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {options.map(opt => (
          <button
            key={opt.key}
            onClick={() => onSubTypeSelect(opt.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "1.1rem 1.5rem",
              background: subType === opt.key ? "var(--moss-green)" : "var(--cream)",
              color: "var(--forest-green)",
              border: `2px solid ${subType === opt.key ? 'var(--leaf-green)' : 'var(--stone-gray)'}`,
              borderRadius: 4,
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s, border 0.2s"
            }}
          >
            <span style={{ fontSize: 24 }}>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
