import React from 'react';
import { Calendar, DollarSign, Target, AlertCircle, ExternalLink, Bookmark, Share2 } from 'lucide-react';
import { STATUS_COLORS, FUNDING_TIERS, MATCH_COLORS } from '../config/colors';

// Enhanced Grant Card Component - Information Dense Design
export default function EnhancedGrantCard({ grant, highlighted = false, viewMode = 'detailed' }) {
  // Helper Functions
  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    const num = parseInt(amount.toString().replace(/[^0-9]/g, ''));
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };
  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const getFundingTier = (amount) => {
    const num = parseInt(amount?.toString().replace(/[^0-9]/g, '') || 0);
    for (const tier of Object.keys(FUNDING_TIERS)) {
      if (num >= FUNDING_TIERS[tier].min) return { tier, ...FUNDING_TIERS[tier] };
    }
    return { tier: 'MICRO', ...FUNDING_TIERS.MICRO };
  };
  const getStatusInfo = (status, days) => {
    if (status === 'forecasted') return STATUS_COLORS.forecasted;
    if (status === 'closed' || days < 0) return STATUS_COLORS.closed;
    if (days <= 7) return STATUS_COLORS.urgent;
    if (days <= 14) return STATUS_COLORS.forecasted;
    return STATUS_COLORS.open;
  };
  const getMatchRequirement = (matchFunds, matchNotes) => {
    if (matchFunds === 'Not Required') return MATCH_COLORS.notRequired;
    if (matchNotes && matchNotes.toLowerCase().includes('required')) return MATCH_COLORS.high;
    if (matchFunds && parseFloat(matchFunds) > 0.15) return MATCH_COLORS.high;
    if (matchFunds && parseFloat(matchFunds) > 0.05) return MATCH_COLORS.low;
    return MATCH_COLORS.notRequired;
  };

  // Data extraction
  const days = getDaysUntilDeadline(grant.ApplicationDeadline);
  const statusInfo = getStatusInfo(grant.Status, days);
  const fundingTier = getFundingTier(grant.EstAvailFunds);
  const matchInfo = getMatchRequirement(grant.MatchFunds, grant.MatchNotes);

  return (
    <div style={{
      border: highlighted ? '2px solid var(--leaf-green)' : '1px solid var(--stone-gray)',
      background: 'var(--cream)',
      borderRadius: 4,
      marginBottom: 24,
      boxShadow: highlighted ? '0 0 0 2px var(--leaf-green)' : 'none',
      padding: '1.5rem',
      position: 'relative',
      transition: 'box-shadow 0.2s, border 0.2s'
    }}>
      {/* Status and Tier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ background: statusInfo.bg, color: statusInfo.color, borderRadius: 4, padding: '0.3em 0.8em', fontWeight: 700, fontSize: 13 }}>{statusInfo.icon} {statusInfo.label || grant.Status}</span>
        <span style={{ background: fundingTier.bg, color: fundingTier.color, borderRadius: 4, padding: '0.3em 0.8em', fontWeight: 700, fontSize: 13 }}>{fundingTier.tier} GRANT</span>
        {matchInfo && <span style={{ background: matchInfo.color + '22', color: matchInfo.color, borderRadius: 4, padding: '0.3em 0.8em', fontWeight: 700, fontSize: 13 }}>{matchInfo.icon} {matchInfo.label}</span>}
      </div>
      {/* Title and Agency */}
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--forest-green)', marginBottom: 4 }}>{grant.GrantTitle}</div>
      <div style={{ color: 'var(--bark-brown)', fontSize: 15, marginBottom: 8 }}>{grant.AgencyName} {grant.EligibleApplicants && <>• <span style={{ color: 'var(--leaf-green)' }}>{grant.EligibleApplicants}</span></>}</div>
      {/* Funding Bars */}
      <div style={{ display: 'flex', gap: 16, margin: '12px 0' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--bark-brown)' }}>Total Available</div>
          <div style={{ fontWeight: 600 }}>{formatCurrency(grant.EstAvailFunds)}</div>
          <div style={{ height: 8, background: '#e6f4ea', borderRadius: 4, marginTop: 4 }}>
            <div style={{ width: `${Math.min(100, (parseInt(grant.EstAvailFunds?.replace(/[^0-9]/g, '')) / 2000000) * 100)}%`, height: 8, background: fundingTier.color, borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--bark-brown)' }}>Per Award</div>
          <div style={{ fontWeight: 600 }}>{formatCurrency(grant.EstAwardMax)}</div>
          <div style={{ height: 8, background: '#e6f4ea', borderRadius: 4, marginTop: 4 }}>
            <div style={{ width: `${Math.min(100, (parseInt(grant.EstAwardMax?.replace(/[^0-9]/g, '')) / 500000) * 100)}%`, height: 8, background: fundingTier.color, borderRadius: 4 }} />
          </div>
        </div>
      </div>
      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: 16, margin: '12px 0' }}>
        <div style={{ fontSize: 13, color: 'var(--bark-brown)' }}>Awards: <b>{grant.EstAwards || 'N/A'}</b></div>
        <div style={{ fontSize: 13, color: 'var(--bark-brown)' }}>Deadline: <b>{formatDate(grant.ApplicationDeadline)}</b></div>
        <div style={{ fontSize: 13, color: 'var(--bark-brown)' }}>Match: <b>{grant.MatchFunds || 'N/A'}</b></div>
      </div>
      {/* Purpose and Requirements */}
      {grant.Purpose && <div style={{ color: 'var(--bark-brown)', fontSize: 15, margin: '10px 0' }}><b>PURPOSE:</b> {grant.Purpose}</div>}
      {grant.KeyRequirements && <div style={{ color: 'var(--bark-brown)', fontSize: 14, margin: '8px 0' }}><b>KEY REQUIREMENTS:</b> {grant.KeyRequirements}</div>}
      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <a href={grant.MoreInfoURL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--leaf-green)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><ExternalLink size={16} /> View Full Details</a>
        <button style={{ background: 'none', border: 'none', color: 'var(--leaf-green)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Bookmark size={16} /> Save</button>
        <button style={{ background: 'none', border: 'none', color: 'var(--leaf-green)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Share2 size={16} /> Share</button>
      </div>
    </div>
  );
}
