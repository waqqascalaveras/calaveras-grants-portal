import React from 'react';
import { Calendar, DollarSign, AlertCircle, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const GrantCard = ({ grant }) => {
  const isRecentlyClosed = (grant) => {
    if (grant.Status?.toLowerCase() !== 'closed') return false;

    const deadline = grant.ApplicationDeadline;
    if (!deadline) return false;

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    return deadlineDate >= thirtyDaysAgo;
  };

  const getStatusBadge = (grant) => {
    const status = grant.Status?.toLowerCase() || 'active';
    const isClosed = isRecentlyClosed(grant);

    if (isClosed) {
      return (
        <span className="status-badge status-closed">
          <Clock size={14} />
          Recently Closed
        </span>
      );
    }

    if (status === 'forecasted') {
      return (
        <span className="status-badge status-forecasted">
          <AlertCircle size={14} />
          Forecasted
        </span>
      );
    }

    return (
      <span className="status-badge status-open">
        <CheckCircle size={14} />
        Open
      </span>
    );
  };

  const isClosed = isRecentlyClosed(grant);

  return (
    <div className={`grant-card ${isClosed ? 'grant-closed' : ''}`}>
      <div className="grant-header">
        <div className="grant-title-section">
          <h3>{grant.Title}</h3>
          <div className="grant-agency">{grant.AgencyDept}</div>
        </div>
        {getStatusBadge(grant)}
      </div>

      <div className="grant-meta">
        {grant.Categories && (
          <div className="grant-categories">
            {grant.Categories.split(';').map((cat, idx) => (
              <span key={idx} className="category-tag">{cat.trim()}</span>
            ))}
          </div>
        )}
      </div>

      <div className="grant-details">
        <div className="detail-row">
          <Calendar size={16} />
          <span>
            <strong>Deadline:</strong> {formatDate(grant.ApplicationDeadline)}
          </span>
        </div>

        <div className="detail-row">
          <DollarSign size={16} />
          <span>
            <strong>Funding:</strong> {formatCurrency(grant.EstAvailFunds)}
            {grant.EstAmounts && ` (${formatCurrency(grant.EstAmounts)} per award)`}
          </span>
        </div>

        {grant.MatchingFunds && grant.MatchingFunds !== 'Not Required' && (
          <div className="detail-row match-required">
            <AlertCircle size={16} />
            <span>
              <strong>Match Required:</strong> {grant.MatchingFunds}
            </span>
          </div>
        )}
      </div>

      {grant.Purpose && (
        <div className="grant-purpose">
          <strong>Purpose:</strong> {grant.Purpose}
        </div>
      )}

      <div className="grant-footer">
        {grant.GrantURL && (
          <a
            href={grant.GrantURL}
            target="_blank"
            rel="noopener noreferrer"
            className="view-details-btn"
          >
            View Full Details
            <ExternalLink size={16} />
          </a>
        )}

        {grant.ContactInfo && (
          <div className="contact-info">
            {grant.ContactInfo.split(';').slice(0, 1).map((info, idx) => (
              <span key={idx}>{info.trim()}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrantCard;