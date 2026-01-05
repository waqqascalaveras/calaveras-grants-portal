import React from "react";
import { getDepartmentsByGroup } from "../config/departments";
import { Building2 } from "lucide-react";

const COMMUNITY_TYPES = [
  { key: "nonprofit", label: "Nonprofit", icon: "🏢" },
  { key: "community_group", label: "Community Group", icon: "👥" },
  { key: "faith_based", label: "Faith-Based Org", icon: "⛪" },
  { key: "education", label: "Educational Institution", icon: "🏫" },
  { key: "tribal", label: "Tribal Organization", icon: "🪶" }
];

export default function DepartmentSelector({ userType, subType, onSubTypeSelect }) {
  const departmentsByGroup = getDepartmentsByGroup();

  if (userType === "cbo") {
    // CBO dropdown with organization types
    return (
      <div className="filter-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Building2 size={16} />
        <select
          value={subType || "all"}
          onChange={(e) => onSubTypeSelect(e.target.value)}
          title="Organization type"
          style={{
            padding: "0.5rem 1rem",
            border: "2px solid var(--stone-gray)",
            borderRadius: 4,
            background: "var(--cream)",
            color: "var(--forest-green)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          <option value="all">All Organizations</option>
          {COMMUNITY_TYPES.map(opt => (
            <option key={opt.key} value={opt.key}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // County dropdown with grouped departments
  return (
    <div className="filter-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Building2 size={16} />
      <select
        value={subType || "all"}
        onChange={(e) => onSubTypeSelect(e.target.value)}
        title="County department"
        style={{
          padding: "0.5rem 1rem",
          border: "2px solid var(--stone-gray)",
          borderRadius: 4,
          background: "var(--cream)",
          color: "var(--forest-green)",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          minWidth: 200
        }}
      >
        <option value="all">All Departments</option>
        {Object.entries(departmentsByGroup).map(([groupName, depts]) => (
          <optgroup key={groupName} label={groupName}>
            {depts.map(dept => (
              <option key={dept.key} value={dept.key}>
                {dept.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
