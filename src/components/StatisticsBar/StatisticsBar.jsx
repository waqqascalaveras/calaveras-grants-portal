import React from "react";
import StatCard from "./StatCard";
import { STATUS_COLORS } from "../config/colors";

export default function StatisticsBar({ totalFunding, eligibleCount, urgentCount, bestMatches }) {
  return (
    <div style={{
      display: "flex",
      gap: 24,
      justifyContent: "center",
      alignItems: "stretch",
      margin: "2rem 0 1.5rem 0"
    }}>
      <StatCard icon="💰" label="Total Available" value={`$${totalFunding.toLocaleString()}`} color="#29422d" bg="#e6f4ea" />
      <StatCard icon="📊" label="Eligible Grants" value={eligibleCount} color={STATUS_COLORS.open.color} bg={STATUS_COLORS.open.bg} />
      <StatCard icon="⏰" label="Urgent (<14d)" value={urgentCount} color={STATUS_COLORS.urgent.color} bg={STATUS_COLORS.urgent.bg} />
      <StatCard icon="⭐" label="Best Matches" value={bestMatches} color="#4e7c4e" bg="#e6f4ea" />
    </div>
  );
}
