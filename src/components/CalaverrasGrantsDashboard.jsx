import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { isEligibleForCounty, isEligibleForCBO, matchesDepartment } from '../utils/eligibilityFilters';
import { getGrantsGovOpportunities } from '../services/grantsGovService';
import { departments } from '../config/departments';
import { Search, Building2, AlertCircle, CheckCircle, Loader, DollarSign, Calendar, FileText, ExternalLink, X, Clock, RefreshCw, Heart } from 'lucide-react';
import UserTypeSelector from './UserTypeSelector';
import DepartmentSelector from './DepartmentSelector';

// Helper function to highlight search terms in text
const HighlightedText = ({ text, query }) => {
  if (!query || !text) return <>{text}</>;
  
  const regex = new RegExp(`(${query.split(/\s+/).filter(Boolean).join('|')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, idx) => 
        regex.test(part) ? (
          <mark key={idx} style={{ backgroundColor: '#ffffcc', padding: '0 2px' }}>{part}</mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  );
};

const CalaverrasGrantsDashboard = () => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userType, setUserType] = useState('all'); // 'all', 'county', 'cbo'
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hoveredGrantId, setHoveredGrantId] = useState(null);
  const [sourceCounts, setSourceCounts] = useState({ ca: 0, federal: 0 });

  // Unique key for grants
  const getGrantId = useCallback((grant) => {
    return grant?.PortalID || grant?.OpportunityID || grant?.GrantID || grant?._sourceId || `${grant?.Title || grant?.GrantTitle || 'grant'}-${grant?.AgencyName || 'agency'}`;
  }, []);
  // Fetch and cache grant data (reusable for manual refresh)
  const fetchGrants = useCallback(async (forceRefresh = false) => {
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

      const useCache = !forceRefresh && cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < twelveHours;

      if (useCache) {
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
      setSourceCounts({ ca: caGrants.length, federal: federalGrants.length });
      
      if (allGrants.length === 0) {
        throw new Error('No grant data available from any source');
      }
      
      setGrants(allGrants);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Grants Portal] Error fetching grants:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('favoriteGrants');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load favorites');
    }
  }, []);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('favoriteGrants', JSON.stringify(favorites));
    } catch (e) {
      // ignore
    }
  }, [favorites]);

  // Base filters (user type, department, search)
  const baseFiltered = useMemo(() => {
    if (grants.length === 0) return [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    return grants.filter(grant => {
      // Filter out grants closed more than 7 days ago
      const status = (grant.Status || '').toLowerCase().trim();
      const isClosed = status.includes('closed') || status.includes('close');
      
      if (isClosed) {
        // Check if deadline is more than 7 days past
        const deadlineStr = grant.ApplicationDeadline;
        if (deadlineStr) {
          const deadlineDate = new Date(deadlineStr);
          if (!isNaN(deadlineDate) && deadlineDate < sevenDaysAgo) {
            return false; // Skip grants closed over 7 days ago
          }
        } else {
          // No deadline info and closed status = filter out
          return false;
        }
      }
      
      if (userType === 'county') {
        if (!isEligibleForCounty(grant)) return false;
      } else if (userType === 'cbo') {
        if (!isEligibleForCBO(grant)) return false;
      }
      if (userType === 'county' && selectedDepartment !== 'all') {
        if (!matchesDepartment(grant, selectedDepartment, departments)) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inTitle = (grant.Title || grant.GrantTitle || '').toLowerCase().includes(q);
        const inAgency = (grant.AgencyName || '').toLowerCase().includes(q);
        const inPurpose = (grant.Purpose || '').toLowerCase().includes(q);
        const inDesc = (grant.Description || '').toLowerCase().includes(q);
        if (!inTitle && !inAgency && !inPurpose && !inDesc) return false;
      }
      return true;
    });
  }, [grants, userType, selectedDepartment, searchQuery]);

  // Status-filtered list
  const filteredGrants = useMemo(() => {
    if (baseFiltered.length === 0) return [];
    if (statusFilter === 'all') return baseFiltered;
    return baseFiltered.filter(grant => {
      const status = (grant.Status || '').toLowerCase().trim();
      if (statusFilter === 'open') {
        return status.includes('open');
      } else if (statusFilter === 'forecasted') {
        return status.includes('forecast');
      }
      return true;
    });
  }, [baseFiltered, statusFilter]);

  // Counts for status pills - use computed status from getStatusBadge
  const statusCounts = useMemo(() => {
    const counts = { open: 0, forecasted: 0 };
    baseFiltered.forEach((grant) => {
      const computedStatus = getStatusBadge(grant.Status, grant.ApplicationDeadline).text.toLowerCase();
      if (computedStatus.includes('forecast')) {
        counts.forecasted += 1;
      }
      if (computedStatus.includes('open')) {
        counts.open += 1;
      }
    });
    return counts;
  }, [baseFiltered]);

  // Parse deadline values with fallbacks for odd formats and rolling deadlines
  const parseDeadline = useCallback((value) => {
    if (!value) return { date: null, label: 'Deadline TBD' };
    const raw = String(value).trim();
    if (!raw) return { date: null, label: 'Deadline TBD' };
    if (/rolling/i.test(raw)) return { date: null, label: 'Rolling' };

    const normalized = raw.replace(/[\u2013\u2014]/g, '-');
    let parsed = new Date(normalized);

    if (isNaN(parsed)) {
      const match = normalized.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
      if (match) {
        const [, m, d, y] = match;
        const year = y.length === 2 ? `20${y}` : y;
        parsed = new Date(`${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
      }
    }

    if (isNaN(parsed)) return { date: null, label: raw };
    return { date: parsed, label: null };
  }, []);

  // Check if grant matches department (for visual emphasis)
  const grantsWithEmphasis = useMemo(() => {
    const now = new Date();
    const withEmphasis = filteredGrants.map(grant => {
      const agencyName = grant.AgencyName
        || grant.Agency
        || grant.Department
        || grant.DepartmentName
        || grant.Division
        || grant.Program
        || grant.Grantor
        || grant.OwnerOrganization
        || grant.Organization
        || grant.SourceAgency
        || grant.FundingAgency
        || 'Agency TBD';

      const deadlineInfo = parseDeadline(grant.ApplicationDeadline);
      const deadlineDate = deadlineInfo.date;
      const daysUntil = deadlineDate ? Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24)) : null;
      const isTooSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 30;
      
      return {
        ...grant,
        AgencyName: agencyName,
        _matchesDept: selectedDepartment === 'all' || matchesDepartment(grant, selectedDepartment, departments),
        _isTooSoon: isTooSoon,
        _daysUntil: daysUntil,
        _deadlineDate: deadlineDate,
        _deadlineLabel: deadlineInfo.label,
        _id: getGrantId(grant)
      };
    });
    
    // Sort: highlighted grants first, then apply column sorting
    let sorted = [...withEmphasis].sort((a, b) => {
      // Primary sort: highlighted (matching department) grants first
      if (a._matchesDept !== b._matchesDept) {
        return b._matchesDept ? 1 : -1; // true comes before false
      }
      
      // Secondary sort: by selected column
      if (sortColumn) {
        let aVal, bVal;
        
        switch(sortColumn) {
          case 'title':
            aVal = (a.Title || a.GrantTitle || '').toLowerCase();
            bVal = (b.Title || b.GrantTitle || '').toLowerCase();
            break;
          case 'amount':
            aVal = parseInt((a.EstAvailFunds || '').replace(/[^0-9]/g, '') || 0);
            bVal = parseInt((b.EstAvailFunds || '').replace(/[^0-9]/g, '') || 0);
            break;
          case 'deadline':
            aVal = a.ApplicationDeadline ? new Date(a.ApplicationDeadline).getTime() : 0;
            bVal = b.ApplicationDeadline ? new Date(b.ApplicationDeadline).getTime() : 0;
            break;
          case 'agency':
            aVal = (a.AgencyName || '').toLowerCase();
            bVal = (b.AgencyName || '').toLowerCase();
            break;
          case 'status':
            aVal = (a.Status || '').toLowerCase();
            bVal = (b.Status || '').toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
      
      return 0;
    });
    
    return sorted;
  }, [filteredGrants, selectedDepartment, sortColumn, sortDirection, getGrantId, parseDeadline]);

  // Format currency
  const formatCurrency = (str) => {
    const num = parseInt((str || '').replace(/[^0-9]/g, ''));
    if (isNaN(num)) return 'N/A';
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  // Format deadline
  const formatDeadline = (dateStr, labelOverride) => {
    const { date, label } = parseDeadline(dateStr);
    if (!date) return labelOverride || label || 'Deadline TBD';
    const days = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Closed';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 14) return `${days}d (Urgent)`;
    if (days <= 30) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status badge
  const getStatusBadge = (status, deadlineStr) => {
    const s = (status || '').toLowerCase();
    
    // Check if explicitly closed
    if (s.includes('closed') || s.includes('close')) {
      return { text: 'Closed', color: '#495057' };
    }
    
    // Check if deadline has passed
    if (deadlineStr) {
      const deadlineDate = new Date(deadlineStr);
      if (!isNaN(deadlineDate) && deadlineDate < new Date()) {
        return { text: 'Closed', color: '#495057' };
      }
    }
    
    if (s.includes('forecast')) return { text: 'Forecasted', color: '#6c757d' };
    if (s.includes('open') || s.includes('active')) return { text: 'Open', color: '#1b4965' };
    return { text: 'Open', color: '#1b4965' };
  };

  // Prepare timeline data
  const timelineData = useMemo(() => {
    const withParsed = grantsWithEmphasis
      .map((g) => {
        const info = parseDeadline(g.ApplicationDeadline);
        return { ...g, _timelineDeadline: info.date, _timelineLabel: info.label };
      })
      .filter(g => g._timelineDeadline);

    const sorted = [...withParsed]
      .sort((a, b) => a._timelineDeadline - b._timelineDeadline)
      .slice(0, 50); // Show first 50 for timeline
    
    return sorted.map(g => {
      const deadline = g._timelineDeadline;
      const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
      const amount = parseInt(g.EstAvailFunds?.replace(/[^0-9]/g, '') || 0);
      return {
        grant: g,
        id: g._id || getGrantId(g),
        deadline,
        daysUntil,
        amount,
        status: (g.Status || '').toLowerCase()
      };
    });
  }, [grantsWithEmphasis, getGrantId, parseDeadline]);

  // Handle column sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
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
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <Building2 size={28} />
            <div>
              <h1>Calaveras County Grants Portal</h1>
            </div>
          </div>
          <div className="header-right">
            {lastUpdated && (
              <span className="cache-time" title={`Last updated ${lastUpdated.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`}>
                <Clock size={14} />
                {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button className="refresh-btn" onClick={() => fetchGrants(true)} title="Refresh grant data">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Filter Bar */}
      <div className="filter-bar">
        <div className="filter-bar-content">
          <UserTypeSelector 
            userType={userType} 
            onUserTypeSelect={(type) => {
              setUserType(type);
              if (type !== 'county') setSelectedDepartment('all');
            }}
          />

          {(userType === 'county' || userType === 'cbo') && (
            <DepartmentSelector 
              userType={userType}
              subType={selectedDepartment}
              onSubTypeSelect={setSelectedDepartment}
            />
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

          <div className="status-toggles" role="group" aria-label="Status filter">
            {[
              { key: 'open', label: 'Open' },
              { key: 'forecasted', label: 'Forecasted' }
            ].map(item => (
              <button
                key={item.key}
                className={`status-pill ${statusFilter === item.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(statusFilter === item.key ? 'all' : item.key)}
                title={`${item.label} (${statusCounts[item.key] || 0})`}
                type="button"
              >
                <CheckCircle size={14} />
                <span>{item.label}</span>
                <span className="pill-count">{statusCounts[item.key] || 0}</span>
              </button>
            ))}
          </div>

          <div className="results-badge">
            <strong>{grantsWithEmphasis.length}</strong> grants
          </div>
        </div>
        <div className="timeline-inline">
          <div className="timeline-meta" aria-live="polite">
            CA: {sourceCounts.ca} • Federal: {sourceCounts.federal}
            {sourceCounts.federal === 0 ? ' (federal feed unavailable?)' : ''}
          </div>
          <div className="timeline">
            <div className="timeline-line"></div>
            {/* Time markers */}
            {[30, 60, 90, 120, 180].map((days) => {
              const maxDays = timelineData.length > 0 ? 
                Math.max(...timelineData.map(item => item.daysUntil || 0)) : 180;
              if (days > maxDays) return null;
              const pos = Math.min(95, (days / maxDays) * 100);
              return (
                <div
                  key={days}
                  className="timeline-marker"
                  style={{ left: `${pos}%` }}
                >
                  {days === 30 ? '1 month' : 
                   days === 60 ? '2 months' : 
                   days === 90 ? '3 months' : 
                   days === 120 ? '4 months' : 
                   '6 months'}
                </div>
              );
            })}
            {timelineData.map((item, idx) => {
              const leftPos = Math.min(95, Math.max(2, (idx / Math.max(timelineData.length - 1, 1)) * 100));
              // Color-code by urgency (days until deadline)
              let dotColor;
              if (item.daysUntil <= 7) {
                dotColor = '#dc3545';
              } else if (item.daysUntil <= 14) {
                dotColor = '#fd7e14';
              } else if (item.daysUntil <= 30) {
                dotColor = '#ffc107';
              } else if (item.daysUntil <= 60) {
                dotColor = '#28a745';
              } else {
                dotColor = '#1b4965';
              }
              const amount = parseInt((item.grant.EstAvailFunds || '').replace(/[^0-9]/g, '') || 0);
              let dotSize;
              if (amount >= 10000000) {
                dotSize = 18;
              } else if (amount >= 5000000) {
                dotSize = 16;
              } else if (amount >= 1000000) {
              } else if (amount >= 500000) {
                dotSize = 12;
              } else if (amount > 0) {
                dotSize = 10;
              } else {
                dotSize = 8;
              }
              const isHovered = hoveredGrantId && hoveredGrantId === item.id;
              const isSelected = selectedGrant && (selectedGrant._id || getGrantId(selectedGrant)) === item.id;
              return (
                <div 
                  key={item.id || idx} 
                  className={`timeline-dot ${isHovered || isSelected ? 'active' : ''}`}
                  style={{ 
                    left: `${leftPos}%`,
                    background: dotColor,
                    width: `${dotSize}px`,
                    height: `${dotSize}px`
                  }}
                  onClick={() => setSelectedGrant(item.grant)}
                  onMouseEnter={() => setHoveredGrantId(item.id)}
                  onMouseLeave={() => setHoveredGrantId(null)}
                >
                  <div className="timeline-tooltip">
                    <div className="tooltip-title">{item.grant.Title || item.grant.GrantTitle}</div>
                    <div className="tooltip-detail">
                      <Calendar size={12} /> {formatDeadline(item.grant.ApplicationDeadline, item.grant._deadlineLabel)}
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
      </div>

      {/* Main Content Area */}
      <div className={`main-content ${selectedGrant ? 'split-view' : ''}`}>
        {/* Grants Table */}
        <div className="table-container">
          <table className="grants-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')} className="sortable">
                  Grant Title {sortColumn === 'title' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('amount')} className="sortable">
                  <DollarSign size={14} /> Amount {sortColumn === 'amount' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('deadline')} className="sortable">
                  <Calendar size={14} /> Deadline {sortColumn === 'deadline' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('agency')} className="sortable">
                  <Building2 size={14} /> Agency {sortColumn === 'agency' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  <CheckCircle size={14} /> Status {sortColumn === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="save-col">Save</th>
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
                  const statusBadge = getStatusBadge(grant.Status, grant.ApplicationDeadline);
                  const rowClasses = [
                    selectedGrant?.PortalID === grant.PortalID ? 'selected' : '',
                    !grant._matchesDept ? 'non-match' : '',
                    grant._isTooSoon ? 'too-soon' : ''
                  ].filter(Boolean).join(' ');
                  
                  return (
                    <tr 
                      key={grant._id}
                      className={rowClasses}
                      onClick={() => setSelectedGrant(grant)}
                      onMouseEnter={() => setHoveredGrantId(grant._id)}
                      onMouseLeave={() => setHoveredGrantId(null)}
                    >
                      <td className="grant-title-cell">
                        <div className="title-text">
                          {grant._source === 'grants.gov' && (
                            <span className="source-badge federal">Federal</span>
                          )}
                          {grant._source === 'ca.gov' && (
                            <span className="source-badge state">CA</span>
                          )}
                          <span className="title-line">{grant.Title || grant.GrantTitle || 'Untitled Grant'}</span>
                        </div>
                        <div className="categories-text">{grant.Categories}</div>
                      </td>
                      <td className="amount-cell">{formatCurrency(grant.EstAvailFunds)}</td>
                      <td className="deadline-cell">
                        {formatDeadline(grant.ApplicationDeadline, grant._deadlineLabel)}
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
                      <td className="save-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`heart-btn ${favorites.includes(grant._id) ? 'active' : ''}`}
                          aria-label="Save to favorites"
                          onClick={() => {
                            setFavorites((prev) => {
                              if (prev.includes(grant._id)) {
                                return prev.filter((id) => id !== grant._id);
                              }
                              return [...prev, grant._id];
                            });
                          }}
                        >
                          <Heart size={16} />
                        </button>
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
              <div className="detail-quick">
                <span className="quick-pill" title="Source">
                  {selectedGrant._source === 'grants.gov' ? (
                    <span className="source-badge federal">Federal (Grants.gov)</span>
                  ) : (
                    <span className="source-badge state">California State</span>
                  )}
                </span>
                <span className="quick-pill" title="Agency">{selectedGrant.AgencyName || 'N/A'}</span>
                <span className="quick-pill strong" title="Amount">{formatCurrency(selectedGrant.EstAvailFunds)}</span>
                <span className="quick-pill" title="Status">
                  <span className="status-dot" style={{ background: getStatusBadge(selectedGrant.Status, selectedGrant.ApplicationDeadline).color }}></span>
                  {getStatusBadge(selectedGrant.Status, selectedGrant.ApplicationDeadline).text}
                </span>
                {selectedGrant.OpportunityNumber && (
                  <span className="quick-pill" title="Opportunity Number">{selectedGrant.OpportunityNumber}</span>
                )}
                {selectedGrant.ALN && (
                  <span className="quick-pill" title="Assistance Listing Number">{selectedGrant.ALN}</span>
                )}
              </div>

              <div className="detail-inline-grid">
                <div className="inline-item" title="Application Deadline">
                  <span className="inline-label">Deadline</span>
                  <span className="inline-value">{formatDeadline(selectedGrant.ApplicationDeadline, selectedGrant._deadlineLabel)}</span>
                </div>
                <div className="inline-item" title="Estimated Awards">
                  <span className="inline-label">Awards</span>
                  <span className="inline-value">{selectedGrant.EstAwards || 'N/A'}</span>
                </div>
                {selectedGrant.PostedDate && (
                  <div className="inline-item" title="Posted">
                    <span className="inline-label">Posted</span>
                    <span className="inline-value">{new Date(selectedGrant.PostedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                <div className="inline-item" title="Categories">
                  <span className="inline-label">Categories</span>
                  <span className="inline-value">{selectedGrant.Categories || 'N/A'}</span>
                </div>
                <div className="inline-item" title="Applicant Type">
                  <span className="inline-label">Applicants</span>
                  <span className="inline-value">{selectedGrant.ApplicantType || 'N/A'}</span>
                </div>
              </div>

              {(selectedGrant.Purpose || selectedGrant.Description) && (
                <div className="detail-text-stack">
                  {selectedGrant.Purpose && (
                    <div className="text-section" title="Purpose">
                      <div className="text-heading">Purpose</div>
                      <p><HighlightedText text={selectedGrant.Purpose} query={searchQuery} /></p>
                    </div>
                  )}
                  {selectedGrant.Description && (
                    <div className="text-section" title="Description">
                      <div className="text-heading">Description</div>
                      <p><HighlightedText text={selectedGrant.Description} query={searchQuery} /></p>
                    </div>
                  )}
                </div>
              )}

              {selectedGrant.GrantInfoURL && (
                <div className="detail-actions tight">
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
          Cache refreshes every 12 hours • 
          Contact: <a href="mailto:WHanafi@calaverascounty.gov">Waqqas Hanafi</a>
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
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
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
        .refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.9rem;
          border: 1px solid #1b4965;
          background: #1b4965;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-btn:hover {
          background: #0d1b2a;
          border-color: #0d1b2a;
        }
        .refresh-btn:active {
          transform: translateY(1px);
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
        .status-toggles {
          display: inline-flex;
          gap: 0.35rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.65rem;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #0d1b2a;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.15s;
          border-radius: 999px;
        }
        .status-pill:hover {
          border-color: #1b4965;
          color: #1b4965;
        }
        .status-pill.active {
          background: #0d1b2a;
          color: #ffffff;
          border-color: #0d1b2a;
        }
        .status-pill .pill-count {
          background: #8b1538;
          color: white;
          padding: 0 0.45rem;
          border-radius: 10px;
          font-size: 0.75rem;
          line-height: 1.2;
          min-width: 20px;
          text-align: center;
        }

        /* Timeline */
        .timeline-inline {
          padding: 0.4rem 2rem 0.7rem;
          background: #ffffff;
          position: relative;
          overflow: visible;
        }
        .timeline-meta {
          display: block;
          font-size: 0.75rem;
          color: #6c757d;
          margin-bottom: 0.1rem;
        }
        .timeline {
          position: relative;
          height: 60px;
          margin: 0.4rem 0;
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
        .timeline-marker {
          position: absolute;
          top: 70%;
          transform: translateX(-50%) rotate(-15deg);
          font-size: 0.7rem;
          color: #b0b0b0;
          margin-top: 4px;
          white-space: nowrap;
          pointer-events: none;
          font-style: italic;
        }
        .timeline-dot {
          position: absolute;
          top: 50%;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .timeline-dot:hover {
          transform: translate(-50%, -50%) scale(1.4);
          z-index: 200;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .timeline-dot.active {
          box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.25), 0 6px 12px rgba(0,0,0,0.25);
          border-color: #8b1538;
        }
        .timeline-dot:hover .timeline-tooltip {
          display: block;
        }
        .timeline-tooltip {
          display: none;
          position: absolute;
          top: 120%;
          left: 50%;
          transform: translateX(-50%);
          background: #0d1b2a;
          color: white;
          padding: 0.45rem 0.55rem;
          border: 1px solid #1b4965;
          min-width: 200px;
          font-size: 0.72rem;
          line-height: 1.3;
          margin-top: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
          z-index: 1200;
          transition: none;
        }
        .tooltip-title {
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: white;
          font-size: 0.78rem;
        }
        .tooltip-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
          color: #c5d5f2;
          font-size: 0.72rem;
        }
        .tooltip-detail svg {
          flex-shrink: 0;
        }

        /* Main Content */
        .main-content {
          display: flex;
          height: calc(100vh - 250px);
          background: #f5f5f5;
          position: relative;
        }
        .main-content.split-view .table-container {
          flex: 0 0 50%;
        }
        .table-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: auto;
          background: white;
          border-right: 1px solid #d1d5db;
          height: 100%;
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
        .grants-table th.save-col {
          width: 60px;
          text-align: center;
        }
        .grants-table th.sortable {
          cursor: pointer;
          user-select: none;
        }
        .grants-table th.sortable:hover {
          background: #d1d5db;
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
        .save-cell {
          text-align: center;
        }
        .heart-btn {
          border: none;
          background: transparent;
          color: #6c757d;
          padding: 0.35rem 0.45rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .heart-btn:hover {
          color: #8b1538;
          background: transparent;
        }
        .heart-btn.active {
          color: #8b1538;
          background: transparent;
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
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .title-text .title-line {
          display: inline-flex;
          align-items: center;
          line-height: 1.3;
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
          height: 100%;
          position: sticky;
          top: 0;
        }
        .detail-header {
          position: sticky;
          top: 0;
          background: #0d1b2a;
          color: white;
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #1b4965;
          z-index: 10;
        }
        .detail-header h2 {
          font-size: 1.1rem;
          margin: 0;
          flex: 1;
          padding-right: 0.75rem;
          color: #ffffff;
          line-height: 1.3;
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
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .detail-quick {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .quick-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.55rem;
          background: #f4f6f8;
          border: 1px solid #dfe4ea;
          border-radius: 999px;
          font-size: 0.85rem;
          color: #0d1b2a;
        }
        .quick-pill.strong {
          font-weight: 700;
          background: #e8eef5;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        .detail-inline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.4rem;
        }
        .inline-item {
          padding: 0.45rem 0.6rem;
          background: #ffffff;
          border: 1px solid #e1e5eb;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-height: 72px;
        }
        .inline-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: #6c757d;
        }
        .inline-value {
          font-size: 0.9rem;
          color: #212529;
          line-height: 1.3;
        }
        .detail-text-stack {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem 0;
          border-top: 1px solid #e1e5eb;
          border-bottom: 1px solid #e1e5eb;
        }
        .text-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .text-heading {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0d1b2a;
        }
        .text-section p {
          margin: 0;
          line-height: 1.45;
          color: #495057;
          font-size: 0.95rem;
        }
        .detail-actions {
          margin-top: 0.25rem;
        }
        .detail-actions.tight {
          margin-top: 0.5rem;
        }
        .detail-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1rem;
          background: #1b4965;
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
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
