import React from "react";

export default function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: bg,
      color,
      borderRadius: 4,
      minWidth: 120,
      padding: "1rem 0.5rem",
      fontWeight: 600,
      fontSize: 18,
      boxShadow: "none"
    }}>
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22 }}>{value}</div>
      <div style={{ fontSize: 13, color: color, opacity: 0.8 }}>{label}</div>
    </div>
  );
}
