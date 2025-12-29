// Centralized color and icon config for status, funding tiers, and match
export const STATUS_COLORS = {
  open: { color: '#2563eb', bg: '#e0e7ef', icon: '🟦' }, // blue
  forecasted: { color: '#64748b', bg: '#f1f5f9', icon: '🟫' }, // gray
  urgent: { color: '#dc2626', bg: '#fef2f2', icon: '🟥' }, // red
  closed: { color: '#6b7280', bg: '#f3f4f6', icon: '⬛' } // dark gray
};

export const FUNDING_TIERS = {
  MEGA: { color: '#1e293b', bg: '#e2e8f0', min: 10000000 }, // navy
  LARGE: { color: '#2563eb', bg: '#e0e7ef', min: 1000000 }, // blue
  MEDIUM: { color: '#64748b', bg: '#f1f5f9', min: 100000 }, // gray
  SMALL: { color: '#0ea5e9', bg: '#e0f2fe', min: 10000 }, // light blue
  MICRO: { color: '#6b7280', bg: '#f3f4f6', min: 0 } // dark gray
};

export const MATCH_COLORS = {
  notRequired: { color: '#2563eb', icon: '✔️' }, // blue
  low: { color: '#64748b', icon: '⚠️' }, // gray
  high: { color: '#dc2626', icon: '⛔' } // red
};
