import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, DollarSign, ExternalLink, Building2, AlertCircle, Clock, CheckCircle, Loader } from 'lucide-react';
import { matchesDepartment } from '../utils/eligibilityFilters';

const CalaverraGrantsDashboard = () => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Department mappings to grant categories
  const departments = {
    all: { name: 'All Departments', keywords: [] },
    'public-health': { 
      name: 'Public Health', 
      keywords: ['Health', 'Human Services', 'Medical', 'Healthcare', 'Disease', 'Prevention', 'Wellness', 'Mental Health', 'Substance']
    },
    'social-services': { 
      name: 'Social Services', 
      keywords: ['Human Services', 'Social', 'Community', 'Housing', 'Homelessness', 'Family', 'Children', 'Youth', 'Senior']
    },
    'public-works': { 
      name: 'Public Works', 
      keywords: ['Transportation', 'Infrastructure', 'Water', 'Wastewater', 'Roads', 'Bridges', 'Construction']
    },
    'planning': { 
      name: 'Planning & Building', 
      keywords: ['Planning', 'Development', 'Land Use', 'Zoning', 'Building', 'Housing', 'Community Development']
    },
    'sheriff': { 
      name: 'Sheriff / Emergency Services', 
      keywords: ['Public Safety', 'Emergency', 'Law Enforcement', 'Fire', 'Disaster', 'Security', 'Crime']
    },
    'environmental': { 
      name: 'Environmental Health', 
      keywords: ['Environment', 'Environmental', 'Climate', 'Sustainability', 'Conservation', 'Natural Resources', 'Energy', 'Waste']
    },
    'parks': { 
      name: 'Parks & Recreation', 
      keywords: ['Recreation', 'Parks', 'Open Space', 'Trails', 'Community Programs', 'Sports', 'Youth Programs']
    },
    'education': { 
      name: 'Education & Workforce', 
      keywords: ['Education', 'Training', 'Workforce', 'Employment', 'Job', 'Career', 'Skills']
    },
    'agriculture': { 
      name: 'Agriculture', 
      keywords: ['Agriculture', 'Farming', 'Rural', 'Food', 'Crop']
    },
    'it': { 
      name: 'IT & Data Modernization', 
      keywords: ['Technology', 'Data', 'Digital', 'Broadband', 'Internet', 'Information Systems', 'Modernization']
    }
  };

  // Fetch and cache grant data
  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cachedData = localStorage.getItem('calaverrasGrantsCache');
        const cacheTimestamp = localStorage.getItem('calaverrasGrantsCacheTime');
        
        const now = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000;
        
        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < twelveHours) {
          // Use cached data
          const parsed = JSON.parse(cachedData);
          setGrants(parsed);
          setLastUpdated(new Date(parseInt(cacheTimestamp)));
          setLoading(false);
          return;
        }
        
        // Fetch fresh data
        const response = await fetch(
          'https://data.ca.gov/api/3/action/datastore_search?resource_id=111c8c88-21f6-453c-ae2c-b4785a0624f5&limit=10000'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch grant data');
        }
        
        const data = await response.json();
        const records = data.result.records;
        
        // Cache the data
        localStorage.setItem('calaverrasGrantsCache', JSON.stringify(records));
        localStorage.setItem('calaverrasGrantsCacheTime', now.toString());
        
        setGrants(records);
        setLastUpdated(new Date(now));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchGrants();
  }, []);

  // Filter grants for Calaveras County eligibility
  const isEligibleForCounty = (grant) => {
    const applicantType = grant.ApplicantType?.toLowerCase() || '';
    
    // Eligible if it accepts public agencies, local governments, or counties
    const eligibleTypes = [
      'public agency',
      'county',
      'local government',
      'government',
      'tribal government'
    ];
    
    // Not eligible if restricted to specific entities that exclude counties
    const restrictedTypes = [
      'individual only',
      'business only',
      'nonprofit only'
    ];
    
    const hasEligibleType = eligibleTypes.some(type => applicantType.includes(type));
    const hasRestrictedType = restrictedTypes.some(type => applicantType.includes(type));
    
    return hasEligibleType || (!hasRestrictedType && applicantType.length > 0);
  };

  // Check if grant is recently closed (within 30 days)
  const isRecentlyClosed = (grant) => {
    if (grant.Status?.toLowerCase() !== 'closed') return false;
    
    const deadline = grant.ApplicationDeadline;
    if (!deadline) return false;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    return deadlineDate >= thirtyDaysAgo;
  };



  // Filter and process grants
  const filteredGrants = useMemo(() => {
    let filtered = grants.filter(grant => {
      // Must be eligible for counties
      if (!isEligibleForCounty(grant)) return false;
      
      // Status filter
      const status = grant.Status?.toLowerCase() || '';
      if (statusFilter === 'open' && status === 'closed' && !isRecentlyClosed(grant)) {
        return false;
      }
      if (statusFilter === 'forecasted' && status !== 'forecasted') {
        return false;
      }
      if (statusFilter === 'active' && status !== 'active') {
        return false;
      }
      
      // Department filter
      if (!matchesDepartment(grant, selectedDepartment, departments)) return false;
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchText = `${grant.Title} ${grant.Purpose} ${grant.Description} ${grant.AgencyDept}`.toLowerCase();
        if (!searchText.includes(query)) return false;
      }
      
      return true;
    });
    
    // Sort: open first, then forecasted, then recently closed (dimmed)
    return filtered.sort((a, b) => {
      const statusOrder = { active: 0, forecasted: 1, closed: 2 };
      const aStatus = a.Status?.toLowerCase() || 'active';
      const bStatus = b.Status?.toLowerCase() || 'active';
      
      if (statusOrder[aStatus] !== statusOrder[bStatus]) {
        return statusOrder[aStatus] - statusOrder[bStatus];
      }
      
      // Within same status, sort by deadline
      const aDeadline = new Date(a.ApplicationDeadline || '2099-12-31');
      const bDeadline = new Date(b.ApplicationDeadline || '2099-12-31');
      return aDeadline - bDeadline;
    });
  }, [grants, selectedDepartment, searchQuery, statusFilter, matchesDepartment]);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    const num = parseInt(amount.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Get status badge
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

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <Loader className="spinner" size={48} />
          <p>Loading California grant opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <Building2 size={32} />
            <div>
              <h1>Calaveras County Grants Portal</h1>
              <p className="subtitle">Find funding opportunities for your department</p>
            </div>
          </div>
          <div className="cache-info">
            {lastUpdated && (
              <span className="cache-time">
                <Clock size={14} />
                Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          {/* Search */}
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search grants by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div className="filter-group">
            <label>
              <Filter size={16} />
              Department
            </label>
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {Object.entries(departments).map(([key, dept]) => (
                <option key={key} value={key}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label>
              <CheckCircle size={16} />
              Status
            </label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="open">Open & Recent</option>
              <option value="forecasted">Forecasted Only</option>
              <option value="active">Active Only</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-count">
          <strong>{filteredGrants.length}</strong> eligible grants found
        </div>
      </div>

      {/* Grants List */}
      <div className="grants-container">
        {filteredGrants.length === 0 ? (
          <div className="no-results">
            <AlertCircle size={48} />
            <h3>No Grants Found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filteredGrants.map((grant) => {
            const isClosed = isRecentlyClosed(grant);
            
            return (
              <div 
                key={grant.PortalID} 
                className={`grant-card ${isClosed ? 'grant-closed' : ''}`}
              >
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
          })
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>
          Data from California State Grants Portal • 
          Showing grants eligible for county government agencies • 
          Cache refreshes every 12 hours
        </p>
      </footer>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .header {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-left svg {
          color: #667eea;
          flex-shrink: 0;
        }

        h1 {
          font-size: 1.75rem;
          color: #1a202c;
          font-weight: 700;
          margin: 0;
        }

        .subtitle {
          color: #718096;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .cache-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cache-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #718096;
          font-size: 0.85rem;
        }

        .filters-section {
          max-width: 1400px;
          margin: 2rem auto;
          padding: 0 2rem;
        }

        .filters-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: #f7fafc;
          transition: all 0.2s;
        }

        .search-box:focus-within {
          border-color: #667eea;
          background: white;
        }

        .search-box svg {
          color: #a0aec0;
          flex-shrink: 0;
        }

        .search-box input {
          border: none;
          background: none;
          flex: 1;
          font-size: 0.95rem;
          outline: none;
          color: #2d3748;
        }

        .search-box input::placeholder {
          color: #a0aec0;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #4a5568;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-group select {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          background: white;
          color: #2d3748;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-group select:hover {
          border-color: #cbd5e0;
        }

        .filter-group select:focus {
          outline: none;
          border-color: #667eea;
        }

        .results-count {
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          text-align: center;
          color: #4a5568;
          font-size: 0.95rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .results-count strong {
          color: #667eea;
          font-size: 1.1rem;
        }

        .grants-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 3rem 2rem;
          display: grid;
          gap: 1.5rem;
        }

        .grant-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border-left: 4px solid #667eea;
        }

        .grant-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .grant-closed {
          opacity: 0.7;
          border-left-color: #cbd5e0;
        }

        .grant-closed:hover {
          opacity: 0.85;
        }

        .grant-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .grant-title-section h3 {
          font-size: 1.25rem;
          color: #1a202c;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .grant-agency {
          color: #667eea;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .status-open {
          background: #c6f6d5;
          color: #22543d;
        }

        .status-forecasted {
          background: #feebc8;
          color: #7c2d12;
        }

        .status-closed {
          background: #e2e8f0;
          color: #4a5568;
        }

        .grant-meta {
          margin-bottom: 1.25rem;
        }

        .grant-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .category-tag {
          background: #edf2f7;
          color: #4a5568;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .grant-details {
          display: grid;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding: 1rem;
          background: #f7fafc;
          border-radius: 8px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #2d3748;
          font-size: 0.9rem;
        }

        .detail-row svg {
          color: #667eea;
          flex-shrink: 0;
        }

        .match-required svg {
          color: #ed8936;
        }

        .grant-purpose {
          color: #4a5568;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.25rem;
          padding: 1rem;
          background: #fafafa;
          border-radius: 8px;
          border-left: 3px solid #e2e8f0;
        }

        .grant-purpose strong {
          color: #2d3748;
        }

        .grant-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding-top: 1.25rem;
          border-top: 1px solid #e2e8f0;
        }

        .view-details-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .view-details-btn:hover {
          background: #5a67d8;
          transform: translateX(2px);
        }

        .contact-info {
          color: #718096;
          font-size: 0.85rem;
        }

        .loading-container,
        .error-container,
        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: white;
          text-align: center;
          gap: 1rem;
        }

        .error-container {
          background: white;
          color: #1a202c;
          border-radius: 12px;
          max-width: 500px;
          margin: 2rem auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .error-container svg {
          color: #f56565;
        }

        .error-container button {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .error-container button:hover {
          background: #5a67d8;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .no-results {
          background: white;
          color: #4a5568;
          border-radius: 12px;
          padding: 3rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .footer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85rem;
        }

        @media (max-width: 1024px) {
          .filters-container {
            grid-template-columns: 1fr;
          }

          .grant-footer {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default CalaverraGrantsDashboard;
