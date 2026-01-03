import React, { useState, useEffect, useMemo } from 'react';
import { isEligibleForCounty, isEligibleForCBO, matchesDepartment } from '../utils/eligibilityFilters';
import { getGrantsGovOpportunities } from '../services/grantsGovService';
import { Search, Building2, AlertCircle, CheckCircle, Loader, DollarSign, Calendar, FileText, ExternalLink, X, User } from 'lucide-react';

const CalaverrasGrantsDashboard = () => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userType, setUserType] = useState('all'); // 'all', 'county', 'cbo'
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');
  const [selectedGrant, setSelectedGrant] = useState(null);

  // Department mappings to grant categories
  const departments = useMemo(() => ({
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
  }), []);

  // Fetch and cache grant data
  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const now = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000;
        
        // Fetch California State Grants
        let caGrants = [];
        const cachedData = localStorage.getItem('calaverrasGrantsCache');
        const cacheTimestamp = localStorage.getItem('calaverrasGrantsCacheTime');
        
        // Helper function to cache data with proper error handling
        const setCacheWithErrorHandling = (key, value, timeKey) => {
          try {
            localStorage.setItem(key, value);
            localStorage.setItem(timeKey, now.toString());
            // eslint-disable-next-line no-console
            console.log(`[Cache] Successfully cached ${key}`);
          } catch (quotaError) {
            if (quotaError.name === 'QuotaExceededError') {
              // eslint-disable-next-line no-console
              console.warn('[Cache] localStorage quota exceeded, clearing old data...');
              try {
                // Clear old grants cache
                localStorage.removeItem('calaverrasGrantsCache');
                localStorage.removeItem('calaverrasGrantsCacheTime');
                localStorage.removeItem('grantsGovCache');
                localStorage.removeItem('grantsGovCacheTime');
                // Try caching again
                localStorage.setItem(key, value);
                localStorage.setItem(timeKey, now.toString());
                // eslint-disable-next-line no-console
                console.log('[Cache] Retried caching after clearing old data');
              } catch (retryError) {
                // eslint-disable-next-line no-console
                console.warn('[Cache] Cache storage still exceeded after clearing, proceeding without cache');
              }
            } else {
              throw quotaError;
            }
          }
        };

        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < twelveHours) {
          // Use cached CA data
          caGrants = JSON.parse(cachedData);
          // eslint-disable-next-line no-console
          console.log(`[CA Grants] Loaded ${caGrants.length} grants from cache`);
        } else {
          // Fetch fresh CA data
          // eslint-disable-next-line no-console
          console.log('[CA Grants] Fetching fresh data from CA API...');
          const response = await fetch(
            'https://data.ca.gov/api/3/action/datastore_search?resource_id=111c8c88-21f6-453c-ae2c-b4785a0624f5&limit=10000'
          );
          
          if (!response.ok) {
            // eslint-disable-next-line no-console
            console.warn(`[CA Grants] API returned status ${response.status}`);
          } else {
            const data = await response.json();
            if (data.success && data.result && data.result.records) {
              caGrants = data.result.records.map(g => ({ ...g, _source: 'ca.gov' }));
              // eslint-disable-next-line no-console
              console.log(`[CA Grants] Fetched ${caGrants.length} grants`);
              
              // Cache only essential fields to reduce storage
              const essentialFields = caGrants.map(g => ({
                PortalID: g.PortalID,
                Title: g.Title || g.GrantTitle,
                AgencyName: g.AgencyName,
                EstAvailFunds: g.EstAvailFunds,
                ApplicationDeadline: g.ApplicationDeadline,
                Status: g.Status,
                Categories: g.Categories,
                ApplicantType: g.ApplicantType,
                Purpose: g.Purpose,
                Description: g.Description,
                _source: g._source
              }));
              setCacheWithErrorHandling('calaverrasGrantsCache', JSON.stringify(essentialFields), 'calaverrasGrantsCacheTime');
            }
          }
        }
        
        // Fetch Federal Grants from Grants.gov
        let federalGrants = [];
        try {
          // eslint-disable-next-line no-console
          console.log('[Federal Grants] Fetching from Grants.gov...');
          federalGrants = await getGrantsGovOpportunities();
          // eslint-disable-next-line no-console
          console.log(`[Federal Grants] Fetched ${federalGrants.length} grants`);
        } catch (fedError) {
          // eslint-disable-next-line no-console
          console.warn('[Federal Grants] Error fetching Grants.gov data:', fedError.message);
          // Continue with CA grants only
        }
        
        // Combine both sources
        const allGrants = [...caGrants, ...federalGrants];
        // eslint-disable-next-line no-console
        console.log(`[Grants Portal] Total grants: ${allGrants.length} (CA: ${caGrants.length}, Federal: ${federalGrants.length})`);
        
        if (allGrants.length === 0) {
          throw new Error('No grant data available from any source');
        }
        
        setGrants(allGrants);
        setLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Grants Portal] Error fetching grants:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchGrants();
  }, []);


  // Filter and process grants with all filters
  const filteredGrants = useMemo(() => {
    if (grants.length === 0) {
      // eslint-disable-next-line no-console
      console.log('[Grants Portal] No grants to filter');
      return [];
    }

    const filtered = grants.filter(grant => {
      // User type eligibility
      if (userType === 'county') {
        if (!isEligibleForCounty(grant)) return false;
      } else if (userType === 'cbo') {
        if (!isEligibleForCBO(grant)) return false;
      }
      // 'all' shows everything

      // Status filter (relaxed to handle variations)
      const status = (grant.Status || '').toLowerCase().trim();
      if (statusFilter === 'open') {
        // Accept open, active, forecasted, or status containing these words
        // If no status, assume it's eligible
        if (status) {
          const isOpenStatus = status.includes('open') || status.includes('active') || status.includes('forecast');
          if (!isOpenStatus) return false;
        }
      } else if (statusFilter === 'forecasted') {
        if (!status.includes('forecast')) return false;
      } else if (statusFilter === 'active') {
        if (!status.includes('active')) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const text = `${grant.Title || grant.GrantTitle || ''} ${grant.Purpose || ''} ${grant.Categories || ''} ${grant.Description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });

    // eslint-disable-next-line no-console
    console.log(`[Grants Portal] Filtered ${filtered.length} grants from ${grants.length} total`);
    // eslint-disable-next-line no-console
    console.log(`[Grants Portal] Filters: userType=${userType}, dept=${selectedDepartment}, status=${statusFilter}, search="${searchQuery}"`);
    
    if (filtered.length === 0 && grants.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('[Grants Portal] All grants filtered out. Check filter criteria:');
      // eslint-disable-next-line no-console
      console.log('- Total grants loaded:', grants.length);
      // eslint-disable-next-line no-console
      console.log('- Sample grant status:', grants[0]?.Status);
      // eslint-disable-next-line no-console
      console.log('- Sample grant title:', grants[0]?.Title || grants[0]?.GrantTitle);
    }

    return filtered;
  }, [grants, userType, selectedDepartment, statusFilter, searchQuery]);

  // Check if grant matches department (for visual emphasis)
  const grantsWithEmphasis = useMemo(() => {
    return filteredGrants.map(grant => {
      const deadline = grant.ApplicationDeadline ? new Date(grant.ApplicationDeadline) : null;
      const daysUntil = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null;
      const isTooSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 30;
      
      return {
        ...grant,
        _matchesDept: selectedDepartment === 'all' || matchesDepartment(grant, selectedDepartment, departments),
        _isTooSoon: isTooSoon,
        _daysUntil: daysUntil
      };
    });
  }, [filteredGrants, selectedDepartment, departments]);

  // Prepare timeline data
  const timelineData = useMemo(() => {
    const sorted = [...grantsWithEmphasis]
      .filter(g => g.ApplicationDeadline)
      .sort((a, b) => new Date(a.ApplicationDeadline) - new Date(b.ApplicationDeadline))
      .slice(0, 50); // Show first 50 for timeline
    
    return sorted.map(g => {
      const deadline = new Date(g.ApplicationDeadline);
      const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
      const amount = parseInt(g.EstAvailFunds?.replace(/[^0-9]/g, '') || 0);
      return {
        grant: g,
        deadline,
        daysUntil,
        amount,
        status: (g.Status || '').toLowerCase()
      };
    });
  }, [grantsWithEmphasis]);

  // Format currency
  const formatCurrency = (str) => {
    const num = parseInt((str || '').replace(/[^0-9]/g, ''));
    if (isNaN(num)) return 'N/A';
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  // Format deadline
  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const days = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Closed';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 14) return `${days}d (Urgent)`;
    if (days <= 30) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('open') || s.includes('active')) return { text: 'Open', color: '#1b4965' };
    if (s.includes('forecast')) return { text: 'Forecasted', color: '#6c757d' };
    return { text: 'Closed', color: '#495057' };
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
          <h3>Error Loading Grants</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
          <details style={{ marginTop: '1rem', textAlign: 'left', fontSize: '0.85rem' }}>
            <summary style={{ cursor: 'pointer', color: '#6c757d' }}>Technical Details</summary>
            <pre style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f8f9fa', overflow: 'auto' }}>
              {JSON.stringify({
                error: error,
                timestamp: new Date().toISOString(),
                cacheAvailable: !!localStorage.getItem('calaverrasGrantsCache')
              }, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Headediv style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="data-source-badge">
                  CA: {dataSource.ca} | Federal: {dataSource.federal}
                </span>
                <span className="cache-time">
                  <Clock size={14} />
                  Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </divName="header-left">
            <Building2 size={28} />
            <div>
              <h1>Calaveras County Grants Portal</h1>
              <p className="subtitle">Find funding opportunities for your department</p>
            </div>
          </div>
          <div className="header-right">
            {lastUpdated && (
              <span className="cache-time">
                <Clock size={14} />
                Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Sticky Filter Bar */}
      <div className="filter-bar">
        <div className="filter-bar-content">
          <div className="filter-group">
            <User size={16} />
            <select 
              value={userType} 
              onChange={(e) => {
                setUserType(e.target.value);
                if (e.target.value !== 'county') setSelectedDepartment('all');
              }}
              title="Who are you?"
            >
              <option value="all">All Users</option>
              <option value="county">County Department</option>
              <option value="cbo">Community Organization</option>
            </select>
          </div>

          {userType === 'county' && (
            <div className="filter-group">
              <Building2 size={16} />
              <select 
                value={selectedDepartment} 
                onChange={(e) => setSelectedDepartment(e.target.value)}
                title="Which department?"
              >
                {Object.entries(departments).map(([key, dept]) => (
                  <option key={key} value={key}>{dept.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search grants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <CheckCircle size={16} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filter by Status"
            >
              <option value="open">Open & Active</option>
              <option value="forecasted">Forecasted</option>
              <option value="active">Active Only</option>
            </select>
          </div>

          <div className="results-badge">
            <strong>{grantsWithEmphasis.length}</strong> grants
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="timeline-container">
        <div className="timeline-header">
          <Calendar size={18} />
          <h3>Grant Deadlines Timeline</h3>
          <span className="timeline-count">{timelineData.length} upcoming deadlines</span>
        </div>
        <div className="timeline">
          <div className="timeline-line"></div>
          {timelineData.map((item, idx) => {
            const leftPos = Math.min(95, Math.max(2, (idx / Math.max(timelineData.length - 1, 1)) * 100));
            const statusBadge = getStatusBadge(item.grant.Status);
            
            return (
              <div 
                key={item.grant.PortalID || idx} 
                className="timeline-dot"
                style={{ 
                  left: `${leftPos}%`,
                  background: statusBadge.color
                }}
                onClick={() => setSelectedGrant(item.grant)}
              >
                <div className="timeline-tooltip">
                  <div className="tooltip-title">{item.grant.Title || item.grant.GrantTitle}</div>
                  <div className="tooltip-detail">
                    <Calendar size={12} /> {formatDeadline(item.grant.ApplicationDeadline)}
                  </div>
                  <div className="tooltip-detail">
                    <DollarSign size={12} /> {formatCurrency(item.grant.EstAvailFunds)}
                  </div>
                  <div className="tooltip-detail">
                    <FileText size={12} /> {item.grant.AgencyName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`main-content ${selectedGrant ? 'split-view' : ''}`}>
        {/* Grants Table */}
        <div className="table-container">
          <table className="grants-table">
            <thead>
              <tr>
                <th>Grant Title</th>
                <th><DollarSign size={14} /> Amount</th>
                <th><Calendar size={14} /> Deadline</th>
                <th><Building2 size={14} /> Agency</th>
                <th><CheckCircle size={14} /> Status</th>
              </tr>
            </thead>
            <tbody>
              {grantsWithEmphasis.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-results-row">
                    <AlertCircle size={24} />
                    <div>
                      <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>No grants found matching your criteria</div>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        Total grants loaded: {grants.length} • 
                        Active filters: {selectedDepartment !== 'all' ? `Department: ${departments[selectedDepartment]?.name}` : 'All departments'} • 
                        Status: {statusFilter}
                        {searchQuery && ` • Search: "${searchQuery}"`}
                      </div>
                      {grants.length === 0 && (
                        <div style={{ marginTop: '0.5rem', color: '#8b1538' }}>
                          No grant data loaded. Check browser console for errors.
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                grantsWithEmphasis.map((grant) => {
                  const statusBadge = getStatusBadge(grant.Status);
                  const rowClasses = [
                    selectedGrant?.PortalID === grant.PortalID ? 'selected' : '',
                    !grant._matchesDept ? 'non-match' : '',
                    grant._isTooSoon ? 'too-soon' : ''
                  ].filter(Boolean).join(' ');
                  
                  return (
                    <tr 
                      key={grant.PortalID || grant.OpportunityID || grant.GrantID}
                      className={rowClasses}
                      onClick={() => setSelectedGrant(grant)}
                    >
                      <td className="grant-title-cell">
                        {grant._source === 'grants.gov' && (
                          <span className="source-badge federal">Federal</span>
                        )}
                        {grant._source === 'ca.gov' && (
                          <span className="source-badge state">CA</span>
                        )}
                        <div className="title-text">{grant.Title || grant.GrantTitle || 'Untitled Grant'}</div>
                        <div className="categories-text">{grant.Categories}</div>
                      </td>
                      <td className="amount-cell">{formatCurrency(grant.EstAvailFunds)}</td>
                      <td className="deadline-cell">
                        {formatDeadline(grant.ApplicationDeadline)}
                        {grant._isTooSoon && grant._daysUntil !== null && (
                          <span className="deadline-warning" title={`Only ${grant._daysUntil} days remaining - may be too short to prepare a quality application`}>
                            ⚠️
                          </span>
                        )}
                      </td>
                      <td className="agency-cell">{grant.AgencyName}</td>
                      <td className="status-cell">
                        <span className="status-badge" style={{ background: statusBadge.color }}>
                          {statusBadge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Grant Details Panel */}
        {selectedGrant && (
          <div className="detail-panel">
            <div className="detail-header">
              <h2>{selectedGrant.Title || selectedGrant.GrantTitle}</h2>
              <button className="close-btn" onClick={() => setSelectedGrant(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <div className="detail-label">Data Source</div>
                <div className="detail-value">
                  {selectedGrant._source === 'grants.gov' ? (
                    <span className="source-badge federal">Federal (Grants.gov)</span>
                  ) : (
                    <span className="source-badge state">California State</span>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Agency</div>
                <div className="detail-value">{selectedGrant.AgencyName}</div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Amount Available</div>
                <div className="detail-value amount-highlight">{formatCurrency(selectedGrant.EstAvailFunds)}</div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Application Deadline</div>
                <div className="detail-value">{formatDeadline(selectedGrant.ApplicationDeadline)}</div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Estimated Awards</div>
                <div className="detail-value">{selectedGrant.EstAwards || 'N/A'}</div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Categories</div>
                <div className="detail-value">{selectedGrant.Categories || 'N/A'}</div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Applicant Type</div>
                <div className="detail-value">{selectedGrant.ApplicantType || 'N/A'}</div>
              </div>

              {selectedGrant.Purpose && (
                <div className="detail-section full-width">
                  <div className="detail-label">Purpose</div>
                  <div className="detail-value description">{selectedGrant.Purpose}</div>
                </div>
              )}

              {selectedGrant.Description && (
                <div className="detail-section full-width">
                  <div className="detail-label">Description</div>
                  <div className="detail-value description">{selectedGrant.Description}</div>
                </div>
              )}

              {selectedGrant.GrantInfoURL && (
                <div className="detail-actions">
                  <a 
                    href={selectedGrant.GrantInfoURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    <ExternalLink size={16} />
                    View Full Grant Details
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>
          Data from California State Grants Portal & Federal Grants.gov • 
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
          background: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        /* Header */
        .header {
          background: #0d1b2a;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          border-bottom: 2px solid #1b4965;
        }
        .header-content {
          max-width: 100%;
          padding: 1rem 2rem;
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
          color: #8b1538;
          flex-shrink: 0;
        }
        h1 {
          font-size: 1.5rem;
          color: #ffffff;
          font-weight: 700;
          margin: 0;
        }
        .
        .data-source-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #b0c4de;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          background: rgba(27, 73, 101, 0.3);
          border: 1px solid #1b4965;
        }subtitle {
          color: #b0c4de;
          font-size: 0.85rem;
          margin-top: 0.15rem;
        }
        .cache-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #8899aa;
          font-size: 0.8rem;
        }

        /* Sticky Filter Bar */
        .filter-bar {
          background: #ffffff;
          border-bottom: 1px solid #d1d5db;
          position: sticky;
          top: 0;
          z-index: 90;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .filter-bar-content {
          max-width: 100%;
          padding: 0.75rem 2rem;
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid #6c757d;
          background: #ffffff;
          flex: 1;
          max-width: 400px;
        }
        .search-box:focus-within {
          border-color: #1b4965;
          box-shadow: 0 0 0 2px rgba(27, 73, 101, 0.1);
        }
        .search-box svg {
          color: #495057;
          flex-shrink: 0;
        }
        .search-box input {
          border: none;
          background: none;
          flex: 1;
          font-size: 0.9rem;
          outline: none;
          color: #212529;
        }
        .search-box input::placeholder {
          color: #6c757d;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .filter-group svg {
          color: #495057;
          flex-shrink: 0;
        }
        .filter-group select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #6c757d;
          font-size: 0.9rem;
          background: white;
          color: #212529;
          cursor: pointer;
        }
        .filter-group select:hover {
          border-color: #495057;
        }
        .filter-group select:focus {
          outline: none;
          border-color: #1b4965;
          box-shadow: 0 0 0 2px rgba(27, 73, 101, 0.1);
        }
        .results-badge {
          margin-left: auto;
          padding: 0.5rem 1rem;
          background: #0d1b2a;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .results-badge strong {
          color: #8b1538;
          font-size: 1rem;
        }

        /* Timeline */
        .timeline-container {
          background: white;
          border-bottom: 1px solid #d1d5db;
          padding: 1.5rem 2rem;
        }
        .timeline-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .timeline-header svg {
          color: #1b4965;
        }
        .timeline-header h3 {
          font-size: 1.1rem;
          color: #0d1b2a;
          margin: 0;
        }
        .timeline-count {
          margin-left: auto;
          color: #6c757d;
          font-size: 0.85rem;
        }
        .timeline {
          position: relative;
          height: 60px;
          margin: 1rem 0;
        }
        .timeline-line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: #d1d5db;
          transform: translateY(-50%);
        }
        .timeline-dot {
          position: absolute;
          top: 50%;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .timeline-dot:hover {
          width: 16px;
          height: 16px;
          z-index: 10;
        }
        .timeline-dot:hover .timeline-tooltip {
          display: block;
        }
        .timeline-tooltip {
          display: none;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #0d1b2a;
          color: white;
          padding: 0.75rem;
          border: 1px solid #1b4965;
          min-width: 250px;
          font-size: 0.8rem;
          margin-bottom: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          z-index: 100;
        }
        .tooltip-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: white;
          font-size: 0.85rem;
        }
        .tooltip-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
          color: #b0c4de;
        }
        .tooltip-detail svg {
          flex-shrink: 0;
        }

        /* Main Content */
        .main-content {
          display: flex;
          min-height: calc(100vh - 250px);
          background: #f5f5f5;
        }
        .main-content.split-view .table-container {
          flex: 0 0 50%;
        }
        .table-container {
          flex: 1;
          overflow-x: auto;
          background: white;
          border-right: 1px solid #d1d5db;
        }

        /* Table */
        .grants-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .grants-table thead {
          position: sticky;
          top: 0;
          background: #e9ecef;
          z-index: 10;
          border-bottom: 2px solid #6c757d;
        }
        .grants-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: #212529;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .grants-table th svg {
          display: inline;
          vertical-align: middle;
          margin-right: 0.25rem;
        }
        .grants-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          transition: background 0.15s;
        }
        .grants-table tbody tr:hover {
          background: #f8f9fa;
        }
        .grants-table tbody tr.selected {
          background: #e3f2fd;
          border-left: 3px solid #1b4965;
        }
        .grants-table tbody tr.non-match {
          opacity: 0.5;
        }
        .grants-table tbody tr.non-match:hover {
          opacity: 0.7;
        }
        .grants-table tbody tr.too-soon {
          opacity: 0.5;
        }
        .grants-table tbody tr.too-soon:hover {
          opacity: 0.7;
        }
        .grants-table tbody tr.non-match.too-soon {
          opacity: 0.35;
        }
        .grants-table tbody tr.non-match.too-soon:hover {
          opacity: 0.55;
        }
        .grants-table td {
          padding: 0.75rem 1rem;
          color: #212529;
        }
        .grant-title-cell {
          max-width: 400px;
        }
        .title-text {
          font-weight: 600;
          color: #0d1b2a;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .title-text.match {
          font-weight: 700;
          color: #000;
        }
          padding: 0.75rem 1rem;
          color: #212529;
        }
        .grant-title-cell {
          max-width: 400px;
        }
        .title-text {
          font-weight: 600;
          color: #0d1b2a;
          margin-bottom: 0.25rem;
        }
        .categories-text {
          font-size: 0.75rem;
          color: #6c757d;
        }
        .source-badge {
          display: inline-block;
          padding: 0.15rem 0.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-radius: 2px;
        }
        .source-badge.federal {
          background: #1b4965;
          color: white;
          border: 1px solid #0d1b2a;
        }
        .source-badge.state {
          background: #8b1538;
          color: white;
          border: 1px solid #6d0f2a;
        }
        .deadline-warning {
          margin-left: 0.5rem;
          font-size: 0.9rem;
          cursor: help;
        }
        .amount-cell {
          font-weight: 600;
          color: #1b4965;
          white-space: nowrap;
        }
        .deadline-cell {
          white-space: nowrap;
          color: #495057;
        }
        .agency-cell {
          color: #495057;
        }
        .status-cell {
          text-align: center;
        }
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .no-results-row {
          text-align: center;
          padding: 3rem !important;
          color: #6c757d;
        }
        .no-results-row svg {
          display: block;
          margin: 0 auto 0.5rem auto;
        }

        /* Detail Panel */
        .detail-panel {
          flex: 0 0 50%;
          background: white;
          overflow-y: auto;
          border-left: 1px solid #d1d5db;
        }
        .detail-header {
          position: sticky;
          top: 0;
          background: #0d1b2a;
          color: white;
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #1b4965;
          z-index: 10;
        }
        .detail-header h2 {
          font-size: 1.25rem;
          margin: 0;
          flex: 1;
          padding-right: 1rem;
        }
        .close-btn {
          background: transparent;
          border: 1px solid #8899aa;
          color: white;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-btn:hover {
          background: #8b1538;
          border-color: #8b1538;
        }
        .detail-content {
          padding: 1.5rem;
        }
        .detail-section {
          margin-bottom: 1.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-section.full-width {
          grid-column: 1 / -1;
        }
        .detail-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6c757d;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .detail-value {
          font-size: 0.95rem;
          color: #212529;
          line-height: 1.5;
        }
        .detail-value.description {
          line-height: 1.6;
          color: #495057;
        }
        .detail-value.amount-highlight {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1b4965;
        }
        .detail-actions {
          margin-top: 1.5rem;
        }
        .detail-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #1b4965;
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
          border: 1px solid #1b4965;
        }
        .detail-link:hover {
          background: #0d1b2a;
          border-color: #0d1b2a;
        }

        /* Loading & Footer */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #495057;
          text-align: center;
          gap: 1rem;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .footer {
          background: #0d1b2a;
          padding: 1.5rem 2rem;
          text-align: center;
          color: #8899aa;
          font-size: 0.8rem;
          border-top: 2px solid #1b4965;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .main-content.split-view {
            flex-direction: column;
          }
          .main-content.split-view .table-container,
          .detail-panel {
            flex: 1 1 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default CalaverrasGrantsDashboard;
