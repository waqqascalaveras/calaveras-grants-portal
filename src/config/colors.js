// Centralized color and icon config for status, funding tiers, and match
export const STATUS_COLORS = {
  open: { color: '#22c55e', bg: '#dcfce7', icon: '🟢' },
  forecasted: { color: '#f59e0b', bg: '#fef3c7', icon: '🟡' },
  urgent: { color: '#ef4444', bg: '#fee2e2', icon: '🔴' },
  closed: { color: '#94a3b8', bg: '#f1f5f9', icon: '⚫' }
};

export const FUNDING_TIERS = {
  MEGA: { color: '#9333ea', bg: '#f3e8ff', min: 10000000 },
  LARGE: { color: '#3b82f6', bg: '#dbeafe', min: 1000000 },
  MEDIUM: { color: '#10b981', bg: '#d1fae5', min: 100000 },
  SMALL: { color: '#f59e0b', bg: '#fef3c7', min: 10000 },
  MICRO: { color: '#6b7280', bg: '#f3f4f6', min: 0 }
};

export const MATCH_COLORS = {
  notRequired: { color: '#22c55e', icon: '✅' },
  low: { color: '#f59e0b', icon: '⚠️' },
  high: { color: '#ef4444', icon: '🔴' }
};
