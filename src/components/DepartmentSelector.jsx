import React from "react";
import { getDepartmentsByGroup, departments } from "../config/departments";

const COMMUNITY_TYPES = [
  { key: "nonprofit", label: "Nonprofit", icon: "🏢" },
  { key: "community_group", label: "Community Group", icon: "👥" },
  { key: "faith_based", label: "Faith-Based Org", icon: "⛪" },
  { key: "education", label: "Educational Institution", icon: "🏫" },
  { key: "tribal", label: "Tribal Organization", icon: "🪶" }
];

export default function DepartmentSelector({ userType, subType, onSubTypeSelect }) {
  const departmentsByGroup = getDepartmentsByGroup();

  if (userType === "community") {
    return (
      <div className="department-selector" style={{ padding: "2rem", maxWidth: 480, margin: "3rem auto", background: "var(--cream)", borderRadius: 4, boxShadow: "none", border: "1px solid var(--stone-gray)" }}>
        <h2 style={{ color: "var(--forest-green)", marginBottom: 24 }}>
          Select Your Organization Type
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {COMMUNITY_TYPES.map(opt => (
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

  return (
    <div className="department-selector" style={{ padding: "2rem", maxWidth: 600, margin: "3rem auto", background: "var(--cream)", borderRadius: 4, boxShadow: "none", border: "1px solid var(--stone-gray)" }}>
      <h2 style={{ color: "var(--forest-green)", marginBottom: 24 }}>
        Select Your County Department
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {Object.entries(departmentsByGroup).map(([groupName, depts]) => (
          <div key={groupName}>
            <h3 style={{ color: "var(--bark-brown)", fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {groupName}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {depts.map(dept => (
                <button
                  key={dept.key}
                  onClick={() => onSubTypeSelect(dept.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.85rem 1.2rem",
                    background: subType === dept.key ? "var(--moss-green)" : "var(--cream)",
                    color: "var(--forest-green)",
                    border: `2px solid ${subType === dept.key ? 'var(--leaf-green)' : 'var(--stone-gray)'}`,
                    borderRadius: 4,
                    fontSize: 15,
                    fontWeight: subType === dept.key ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "left"
                  }}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
