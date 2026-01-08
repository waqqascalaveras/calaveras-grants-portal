import React from "react";
import { getDepartmentsByGroup } from "../../config/departments";
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
        <Building2 size={16} style={{ color: '#1b4965' }} />
        <select
          value={subType || "all"}
          onChange={(e) => onSubTypeSelect(e.target.value)}
          title="Organization type"
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid #d1d5db",
            borderRadius: 4,
            background: "#ffffff",
            color: "#0d1b2a",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            outline: "none"
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
      <Building2 size={16} style={{ color: '#1b4965' }} />
      <select
        value={subType || "all"}
        onChange={(e) => onSubTypeSelect(e.target.value)}
        title="County department"
        style={{
          padding: "0.5rem 1rem",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          background: "#ffffff",
          color: "#0d1b2a",
          fontSize: "0.85rem",
          fontWeight: 500,
          cursor: "pointer",
          minWidth: 200,
          outline: "none"
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
