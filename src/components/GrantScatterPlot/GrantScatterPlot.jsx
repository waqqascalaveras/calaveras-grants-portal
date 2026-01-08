import React from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { STATUS_COLORS } from "../config/colors";

export default function GrantScatterPlot({ data, onGrantClick: _onGrantClick }) {
  return (
    <div style={{ background: "var(--cream)", borderRadius: 4, padding: "1.5rem", margin: "2rem 0", border: "1px solid var(--stone-gray)" }}>
      <h3 style={{ color: "var(--forest-green)", marginBottom: 16 }}>Grant Landscape: Amount vs. Deadline</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 16, right: 32, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name="Days Until Deadline" tickFormatter={d => d === 0 ? "Now" : `${d}d`} />
          <YAxis type="number" dataKey="y" name="Amount ($)" tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, n) => n === 'y' ? `$${v.toLocaleString()}` : v} />
          <Scatter name="Grants" data={data}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={STATUS_COLORS[entry.status]?.color || '#8884d8'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 13, color: "var(--bark-brown)", marginTop: 8 }}>
        <span style={{ marginRight: 16 }}>🟢 Open</span>
        <span style={{ marginRight: 16 }}>🟡 Forecasted</span>
        <span style={{ marginRight: 16 }}>🔴 Urgent</span>
        <span>⚫ Closed</span>
      </div>
    </div>
  );
}
