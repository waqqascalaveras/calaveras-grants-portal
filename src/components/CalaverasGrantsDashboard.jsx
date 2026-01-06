import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { isEligibleForCounty, isEligibleForCBO, matchesDepartment, calculateCBORelevance } from '../utils/eligibilityFilters';
import { getUnifiedGrants, getCacheInfo } from '../services/unifiedGrantService';
import { departments } from '../config/departments';
import { Search, Building2, AlertCircle, CheckCircle, DollarSign, Calendar, FileText, ExternalLink, X, Clock, RefreshCw, Heart, HelpCircle } from 'lucide-react';
import UserTypeSelector from './UserTypeSelector';
import DepartmentSelector from './DepartmentSelector';
import SmartTooltip from './SmartTooltip';
import Loading from './Loading/Loading';

// Helper component for info tooltips - now using SmartTooltip with Floating UI
const InfoTooltip = ({ text }) => (
  <SmartTooltip text={text} side="top">
    <HelpCircle size={14} className="info-icon" style={{ cursor: 'help' }} />
  </SmartTooltip>
);

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

// Helper function to render HTML and formatted text safely
const FormattedText = ({ text, query }) => {
  if (!text) return null;
  
  // Split by double newlines for paragraph breaks; preserve single newlines
  const paragraphs = text.split(/\r?\n\r?\n+/).filter(p => p.trim());
  
  const renderParagraph = (para, pIdx) => {
    // Within each paragraph, convert single newlines to <br /> tags
    const lines = para.split(/\r?\n/).filter(l => l.trim());
    // Parse HTML-like content (basic <a> tag support), auto-link raw URLs, and email addresses
    const aTagRegex = /<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    const urlRegex = /(https?:\/\/[^\s<]+)/gi;
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    let match;
    
    // Process all lines together to collect matches across the full paragraph
    const lineText = lines.join('\n');
    const matches = [];
    
    // Collect anchor tags
    while ((match = aTagRegex.exec(lineText)) !== null) {
      matches.push({
        start: match.index,
        end: aTagRegex.lastIndex,
        url: match[1],
        text: match[2],
        type: 'link'
      });
    }

    // Collect bare URLs
    while ((match = urlRegex.exec(lineText)) !== null) {
      matches.push({
        start: match.index,
        end: urlRegex.lastIndex,
        url: match[1],
        text: match[1],
        type: 'url'
      });
    }

    // Collect email addresses
    emailRegex.lastIndex = 0;
    while ((match = emailRegex.exec(lineText)) !== null) {
      matches.push({
        start: match.index,
        end: emailRegex.lastIndex,
        url: `mailto:${match[1]}`,
        text: match[1],
        type: 'email'
      });
    }
    
    if (matches.length === 0) {
      // No HTML tags, just render with line breaks and highlighting
      return (
        <p key={pIdx}>
          {lines.map((line, lineIdx) => (
            <React.Fragment key={lineIdx}>
              {lineIdx > 0 && <br />}
              <HighlightedText text={line} query={query} />
            </React.Fragment>
          ))}
        </p>
      );
    }
    
    // Sort and deduplicate overlapping matches
    matches.sort((a, b) => a.start - b.start);
    const deduped = [];
    matches.forEach(m => {
      if (!deduped.some(d => (m.start < d.end && m.end > d.start))) {
        deduped.push(m);
      }
    });
    
    // Render with links and line breaks
    const parts = [];
    let lastIndex = 0;
    
    deduped.forEach((m, idx) => {
      if (m.start > lastIndex) {
        const textBefore = lineText.substring(lastIndex, m.start);
        parts.push(
          <React.Fragment key={`text-${idx}`}>
            {textBefore.split('\n').map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {lineIdx > 0 && <br />}
                <HighlightedText text={line} query={query} />
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      }
      parts.push(
        <a key={`link-${idx}`} href={m.url} target={m.type === 'email' ? '_self' : '_blank'} rel={m.type === 'email' ? '' : 'noopener noreferrer'} 
           style={{ color: m.type === 'email' ? '#8b1538' : '#1b4965', textDecoration: 'underline', fontWeight: 500 }}>
          <HighlightedText text={m.text} query={query} />
        </a>
      );
      lastIndex = m.end;
    });
    
    if (lastIndex < lineText.length) {
      const textEnd = lineText.substring(lastIndex);
      parts.push(
        <React.Fragment key="text-end">
          {textEnd.split('\n').map((line, lineIdx) => (
            <React.Fragment key={lineIdx}>
              {lineIdx > 0 && <br />}
              <HighlightedText text={line} query={query} />
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    }
    
    return <p key={pIdx}>{parts}</p>;
  };
  
  return <>{paragraphs.map((para, idx) => renderParagraph(para, idx))}</>;
};

const CalaverasGrantsDashboard = () => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userType, setUserType] = useState('all'); // 'all', 'county', 'cbo'
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [statusFilter, setStatusFilter] = useState({ open: false, forecasted: false, closed: false });
  const [favorites, setFavorites] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hoveredGrantId, setHoveredGrantId] = useState(null);
  const [sourceCounts, setSourceCounts] = useState({ ca: 0, federal: 0 });
  const [sourceFilters, setSourceFilters] = useState({ ca: true, federal: true });
  const [favoriteFilter, setFavoriteFilter] = useState('all');
  const [lastAttemptTs, setLastAttemptTs] = useState(null);
  const [lastMeta, setLastMeta] = useState(null);
  const [splitWidth, setSplitWidth] = useState(55); // percent width for table when detail open
  const [isResizing, setIsResizing] = useState(false);
  const [loadingGrantDetails, setLoadingGrantDetails] = useState(false);
  const mainContentRef = useRef(null);
  const rowRefs = useRef({});

  // Unique key for grants
  const getGrantId = useCallback((grant) => {
    return grant?.PortalID || grant?.OpportunityID || grant?.GrantID || grant?._sourceId || `${grant?.Title || grant?.GrantTitle || 'grant'}-${grant?.AgencyName || 'agency'}`;
  }, []);

  // Fetch federal grant details on demand
  const fetchFederalGrantDetails = useCallback(async (grant) => {
    const oppId = grant.OpportunityID || grant._sourceId;
    if (!oppId) {
      console.warn('No opportunity ID found for federal grant');
      return null;
    }

    // Check cache first (24-hour expiry)
    const cacheKey = `federalGrantDetails_${oppId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < 24 * 60 * 60 * 1000) { // 24 hours
          // eslint-disable-next-line no-console
          console.log('Using cached federal grant details');
          return data;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to parse cached grant details', e);
      }
    }
// eslint-disable-next-line no-console
    
    // Fetch from API
    console.log(`Fetching details for federal grant ${oppId}...`);
    setLoadingGrantDetails(true);
    
    try {
      const response = await fetch(
        `https://api.grants.gov/v1/api/opportunities/${oppId}`,
        {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000) // 10s timeout
        }
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const oppData = data?.data?.opportunity;
      
      if (!oppData) {
        console.warn('No opportunity data in API response');
        return null;
      }

      // Extract description fields
      const details = {
        Description: oppData.description || oppData.synopsis || '',
        Purpose: oppData.synopsis || oppData.summary || '',
        _detailsFetched: true
      };

      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify({
        data: details,
        timestamp: Date.now()
      }));
// eslint-disable-next-line no-console
      console.log('Successfully fetched federal grant details');
      return details;
    } catch (error) {
      // eslint-disable-next-line no-console
    } catch (error) {
      console.error('Failed to fetch federal grant details:', error);
      return null;
    } finally {
      setLoadingGrantDetails(false);
    }
  }, []);

  // Handle grant selection with on-demand detail fetching for federal grants
  const handleGrantSelect = useCallback(async (grant) => {
    if (!grant) {
      setSelectedGrant(null);
      return;
    }

    // Immediately show the grant (even without full details)
    setSelectedGrant(grant);

    // If it's a federal grant without description, fetch details
    const isFederal = (grant.Source || '').toLowerCase() === 'federal' || 
                      (grant._source || '').toLowerCase().includes('grant');
    
    if (isFederal && !grant.Description && !grant._detailsFetched) {
      const details = await fetchFederalGrantDetails(grant);
      if (details) {
        // Update the grant with fetched details
        const updatedGrant = { ...grant, ...details };
        setSelectedGrant(updatedGrant);
        
        // Also update in the grants array so we don't refetch
        setGrants(prevGrants => prevGrants.map(g => 
          getGrantId(g) === getGrantId(grant) ? updatedGrant : g
        ));
      }
    }
  }, [fetchFederalGrantDetails, getGrantId]);

  // Normalize grant record fields with fallbacks (define before fetchGrants which uses it)
  const normalizeGrantRecord = useCallback((grant) => {
    const rawSource = (grant._source || grant.Source || '').toLowerCase();
    const normalizedSource = rawSource.includes('grant') || rawSource === 'federal'
      ? 'grants.gov'
      : rawSource.includes('ca') || rawSource === 'state'
        ? 'ca.gov'
        : rawSource || null;

    const extractDateFromText = (text) => {
      if (!text) return null;
      const patterns = [
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}\b/gi,
        /\b\d{1,2}[./-]\d{1,2}[./-]\d{4}\b/g
      ];
      for (const regex of patterns) {
        const match = regex.exec(text);
        if (match && match[0]) {
          const candidate = new Date(match[0]);
          if (!isNaN(candidate)) return candidate.toISOString();
        }
      }
      return null;
    };

    const agencyFallbackRaw = grant.AgencyName
      || grant.Agency
      || grant.Grantor
      || grant.Department
      || grant.DepartmentName
      || grant.Division
      || grant.Program
      || grant.SourceAgency
      || grant.FundingAgency
      || grant.OrganizationName
      || grant.OwnerOrganization
      || grant.Organization
      || grant.agencyName
      || grant.agency;
    const agencyFallback = agencyFallbackRaw ? String(agencyFallbackRaw).trim() : null;

    // Pick the best available deadline and remember where it came from
    const deadlineCandidates = [
      { value: grant.ApplicationDeadline, source: 'Application Deadline' },
      { value: grant.Deadline, source: 'Deadline' },
      { value: grant.CloseDate, source: 'Close Date' },
      { value: grant.DueDate, source: 'Due Date' },
      { value: grant.SubmissionDeadline, source: 'Submission Deadline' },
      { value: grant.SubmissionCloseDate, source: 'Submission Close Date' },
      { value: grant.SubmissionDueDate, source: 'Submission Due Date' },
      { value: grant.EstimatedApplicationDueDate || grant.EstimatedAppDueDate, source: 'Estimated Application Due Date' },
      { value: grant.EstimatedDueDate, source: 'Estimated Due Date' },
      { value: grant.EstimatedCloseDate, source: 'Estimated Close Date' },
      { value: grant.EstimatedPostDate, source: 'Estimated Post Date' },
      { value: grant.ForecastedDate, source: 'Forecasted Date' },
      { value: grant.EndDate, source: 'End Date' }
    ];

    let chosenDeadline = deadlineCandidates.find(c => c.value && String(c.value).trim());
    let deadlineFallback = chosenDeadline?.value || null;
    let deadlineSource = chosenDeadline?.source || null;

    if (!deadlineFallback) {
      const derived = extractDateFromText(grant.Description || grant.Purpose || '');
      if (derived) {
        deadlineFallback = derived;
        deadlineSource = 'Derived from description';
      }
    }

    const applicantTypeFallback = grant.ApplicantType
      || grant.EligibleApplicants
      || grant.Eligibility
      || grant.EligibleApplicantsText;
    const fundingFallback = grant.EstAvailFunds
      || grant.FundingAmount
      || grant.AwardAmount
      || grant.MaxAward
      || grant.Amount
      || grant.EstimatedAmount;

    return {
      ...grant,
      _source: normalizedSource,
      Source: normalizedSource || grant.Source,
      AgencyName: agencyFallback || 'Agency TBD',
      ApplicationDeadline: deadlineFallback,
      ApplicationDeadlineSource: deadlineSource,
      ApplicantType: applicantTypeFallback || grant.ApplicantType || '',
      EstAvailFunds: fundingFallback || grant.EstAvailFunds || 'N/A'
    };
  }, []);

  // Fetch unified grants (CA + Federal, deduplicated, cached)
  const fetchGrants = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setErrorInfo(null);
      setLastAttemptTs(new Date());

      // Fetch from unified service (server-side cache + client-side caching)
      const data = await getUnifiedGrants(forceRefresh);
      
      // Extract grants and metadata
      const allGrants = data.grants || [];
      const sources = data.sources || { ca: { count: 0 }, federal: { count: 0 } };
      
      // eslint-disable-next-line no-console
      console.log(
        `[Unified Grants] Loaded ${allGrants.length} grants ` +
        `(CA: ${sources.ca.count}, Federal: ${sources.federal.count}, ` +
        `Duplicates removed: ${data.duplicates?.count || 0})`
      );
      
      setSourceCounts({ 
        ca: sources.ca.count, 
        federal: sources.federal.count 
      });
      setLastMeta({
        fetchedAt: data.fetchedAt || new Date().toISOString(),
        totalCount: typeof data.totalCount === 'number' ? data.totalCount : allGrants.length,
        sources: data.sources,
        duplicates: data.duplicates,
        success: data.success !== false
      });
      
      if (allGrants.length === 0) {
        // No data yet; show empty state but avoid error screen
        setGrants([]);
        setLastUpdated(new Date(data.fetchedAt || Date.now()));
        setLoading(false);
        return;
      }
      
      setGrants(allGrants.map(normalizeGrantRecord));
      setLastUpdated(new Date(data.fetchedAt || Date.now()));
      setLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Grants Portal] Error fetching grants:', err);
      setErrorInfo({
        message: err?.message || 'Failed to load grants',
        name: err?.name,
        stack: err?.stack
      });
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizeGrantRecord]);

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

  // Split-pane resizing
  useEffect(() => {
    if (!isResizing) return undefined;
    const handleMove = (event) => {
      const rect = mainContentRef.current?.getBoundingClientRect();
      if (!rect) return;
      const relativeX = event.clientX - rect.left;
      const pct = (relativeX / rect.width) * 100;
      const clamped = Math.min(70, Math.max(35, pct));
      setSplitWidth(clamped);
    };
    const stop = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stop);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stop);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!selectedGrant) {
      setIsResizing(false);
    }
  }, [selectedGrant]);

  // When a grant is selected (e.g., from the timeline), scroll its row into view in the list
  useEffect(() => {
    if (!selectedGrant) return;
    const id = getGrantId(selectedGrant);
    const el = rowRefs.current[id];
    if (el && typeof el.scrollIntoView === 'function') {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      } catch (e) {
        // Fallback without smooth behavior if not supported
        el.scrollIntoView();
      }
    }
  }, [selectedGrant, getGrantId]);

  // Base filters (user type, department, search, source)
  const baseFiltered = useMemo(() => {
    if (grants.length === 0) return [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    return grants.filter(grant => {
      // Source filter - skip if neither source is selected, or grant doesn't match selected sources
      const grantSource = grant._source;
      const isCAGrant = grantSource === 'ca.gov';
      const isFederalGrant = grantSource === 'grants.gov';
      
      // If neither source is selected, show no grants
      if (!sourceFilters.ca && !sourceFilters.federal) {
        return false;
      }
      
      // Skip grants that don't match any selected source
      if (isCAGrant && !sourceFilters.ca) return false;
      if (isFederalGrant && !sourceFilters.federal) return false;
      
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
      // Note: CBO subtype (selectedDepartment for CBOs) does NOT filter grants
      // All CBO subtypes see all CBO-eligible grants
      // Relevance scoring is applied later for prioritization
      
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
  }, [grants, userType, selectedDepartment, searchQuery, sourceFilters]);

  // Get status badge - must be defined before statusCounts
  const getStatusBadge = useCallback((status, deadlineStr) => {
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
  }, []);

  // Status-filtered list - use computed status from getStatusBadge
  const filteredGrants = useMemo(() => {
    if (baseFiltered.length === 0) return [];
    let result = baseFiltered;
    
    // Apply status filter (multi-select)
    const activeStatuses = Object.entries(statusFilter).filter(([_k, v]) => v).map(([k]) => k);
    if (activeStatuses.length > 0) {
      result = result.filter(grant => {
        const s = getStatusBadge(grant.Status, grant.ApplicationDeadline).text.toLowerCase();
        const matchOpen = activeStatuses.includes('open') && s.includes('open');
        const matchForecast = activeStatuses.includes('forecasted') && s.includes('forecast');
        const matchClosed = activeStatuses.includes('closed') && s.includes('closed');
        return matchOpen || matchForecast || matchClosed;
      });
    }
    
    // Apply favorites filter
    if (favoriteFilter === 'saved') {
      result = result.filter(grant => favorites.includes(getGrantId(grant)));
    }
    
    // Add relevance scoring for CBO subtypes
    if (userType === 'cbo' && selectedDepartment !== 'all') {
      result = result.map(grant => ({
        ...grant,
        _relevanceScore: calculateCBORelevance(grant, selectedDepartment)
      }));
      
      // Sort by relevance (highest first), then by deadline
      result = result.sort((a, b) => {
        const scoreDiff = (b._relevanceScore || 0) - (a._relevanceScore || 0);
        if (Math.abs(scoreDiff) > 0.5) return scoreDiff; // Significant score difference
        
        // Similar scores - sort by deadline
        const dateA = new Date(a.ApplicationDeadline);
        const dateB = new Date(b.ApplicationDeadline);
        if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
        return 0;
      });
    }
    
    return result;
  }, [baseFiltered, statusFilter, favoriteFilter, favorites, getStatusBadge, getGrantId, userType, selectedDepartment]);

  // Counts for status pills - use computed status from getStatusBadge
  const statusCounts = useMemo(() => {
    const counts = { open: 0, forecasted: 0, closed: 0 };
    baseFiltered.forEach((grant) => {
      const computedStatus = getStatusBadge(grant.Status, grant.ApplicationDeadline).text.toLowerCase();
      if (computedStatus.includes('forecast')) {
        counts.forecasted += 1;
      }
      if (computedStatus.includes('open')) {
        counts.open += 1;
      }
      if (computedStatus.includes('closed')) {
        counts.closed += 1;
      }
    });
    return counts;
  }, [baseFiltered, getStatusBadge]);

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
      const agencyNameRaw = grant.AgencyName
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
        || grant.agencyName
        || grant.agency
        || '';
      const agencyName = agencyNameRaw ? String(agencyNameRaw).trim() : '';

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
        _deadlineSource: grant.ApplicationDeadlineSource || (deadlineInfo.label ? 'Deadline Label' : null),
        _id: getGrantId(grant)
      };
    });
    
    // Sort: apply column sorting without department match interference
    let sorted = [...withEmphasis].sort((a, b) => {
      // If a column is selected, apply that sort FIRST (don't let department match interfere)
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
        // When values are equal, use department match as tiebreaker
        if (a._matchesDept !== b._matchesDept) {
          return b._matchesDept ? 1 : -1;
        }
        return 0;
      }
      
      // No column selected: highlight matching department grants first
      if (a._matchesDept !== b._matchesDept) {
        return b._matchesDept ? 1 : -1; // true comes before false
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
    const { date } = parseDeadline(dateStr);
    if (!date) {
      // Estimate deadline if missing - typically grants have windows of a few months
      if (labelOverride && labelOverride !== 'Deadline TBD') return labelOverride;
      return 'Est. deadline varies';
    }
    const days = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Closed';
    const dateStr_formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (days === 0) return `Today (${dateStr_formatted})`;
    if (days === 1) return `Tomorrow (${dateStr_formatted})`;
    if (days <= 14) return `${dateStr_formatted} (${days}d)`;
    if (days <= 30) return `${dateStr_formatted} (${days}d)`;
    return dateStr_formatted;
  };

  const formatDeadlineDetailed = (dateStr, labelOverride) => {
    const { date } = parseDeadline(dateStr);
    if (!date) {
      if (labelOverride && labelOverride !== 'Deadline TBD') return labelOverride;
      return 'Deadline varies (check details)';
    }
    const now = new Date();
    if (date < now) return 'Closed';

    const days = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const weeks = Math.floor((days % 30) / 7);
    const parts = [];
    if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (weeks > 0) parts.push(`${weeks} week${weeks !== 1 ? 's' : ''}`);
    if (parts.length === 0) parts.push('Under 1 week');

    const longDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${longDate} (${parts.join(', ')})`;
  };

  const buildGrantLink = (grant) => {
    if (!grant) return null;
    if (grant.GrantInfoURL) return grant.GrantInfoURL;
    if (grant.URL) return grant.URL;
    if (grant.Source === 'ca.gov' || grant._source === 'ca') {
      // Attempt to build grants.ca.gov URL from title slug if PortalID missing
      const slug = (grant.Title || grant.GrantTitle || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      if (slug) {
        return `https://www.grants.ca.gov/grants/${slug}/`;
      }
    }
    if (grant._source === 'grants.gov') {
      // Prefer numeric opportunity ID if available
      const numericId = [grant.OpportunityID, grant.GrantID, grant.OpportunityNumber]
        .map(v => (v == null ? null : String(v)))
        .find(v => v && /^\d+$/.test(v));
      if (numericId) {
        return `https://www.grants.gov/search-results-detail/${numericId}`;
      }

      // Fallback to Simpler Grants using GUID
      const guid = grant._sourceId || grant.PortalID?.replace(/^gov-/, '');
      if (guid && /^[0-9a-fA-F-]{36}$/.test(String(guid))) {
        return `https://simpler.grants.gov/opportunity/${guid}`;
      }
      // Else, no valid link
    }
    return null;
  };

  // Prepare timeline data
  const timelineData = useMemo(() => {
    const withParsed = grantsWithEmphasis
      .map((g) => {
        const info = parseDeadline(g.ApplicationDeadline);
        return { ...g, _timelineDeadline: info.date, _timelineLabel: info.label };
      })
      .filter(g => g._timelineDeadline);

    // Calculate days until for filtering
    const now = new Date();
    const withDaysUntil = withParsed.map(g => ({
      ...g,
      _daysUntil: Math.ceil((g._timelineDeadline - now) / (1000 * 60 * 60 * 24))
    }));

    // Exclude grants expiring in < 30 days
    const relevant = withDaysUntil.filter(g => g._daysUntil >= 30);

    const sorted = [...relevant]
      .sort((a, b) => a._timelineDeadline - b._timelineDeadline)
      .slice(0, 50); // Show first 50 for timeline
    
    return sorted.map(g => {
      const deadline = g._timelineDeadline;
      const amount = parseInt(g.EstAvailFunds?.replace(/[^0-9]/g, '') || 0);
      return {
        grant: g,
        id: g._id || getGrantId(g),
        deadline,
        daysUntil: g._daysUntil,
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
        <Loading />
      </div>
    );
  }

  const cacheInfo = getCacheInfo();
  const baseDiagnostics = {
    lastAttempt: lastAttemptTs ? lastAttemptTs.toISOString() : null,
    fetchedAt: lastMeta?.fetchedAt || null,
    totalCount: lastMeta?.totalCount ?? null,
    success: lastMeta?.success,
    sources: lastMeta?.sources || null,
    duplicates: lastMeta?.duplicates || null,
    cache: {
      available: cacheInfo.hasClientCache,
      ageMinutes: cacheInfo.clientCacheAge,
      timestamp: cacheInfo.clientCacheTimestamp ? cacheInfo.clientCacheTimestamp.toISOString() : null,
      durationMs: cacheInfo.clientCacheDuration
    }
  };

  if (!loading && !errorInfo && grants.length === 0) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <AlertCircle size={48} />
          <h3>No grant data available</h3>
          <p>We could not load grants yet. Please try refreshing in a moment.</p>
          <button onClick={() => fetchGrants(true)}>Retry</button>
          <details style={{ marginTop: '1rem', textAlign: 'left', fontSize: '0.85rem' }}>
            <summary style={{ cursor: 'pointer', color: '#6c757d' }}>Technical Details</summary>
            <pre style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f8f9fa', overflow: 'auto' }}>
              {JSON.stringify({
                ...baseDiagnostics,
                grantsLength: grants.length,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  if (errorInfo) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <AlertCircle size={48} />
          <h3>Error Loading Grants</h3>
          <p>{errorInfo.message}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
          <details style={{ marginTop: '1rem', textAlign: 'left', fontSize: '0.85rem' }}>
            <summary style={{ cursor: 'pointer', color: '#6c757d' }}>Technical Details</summary>
            <pre style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f8f9fa', overflow: 'auto' }}>
              {JSON.stringify({
                ...baseDiagnostics,
                error: errorInfo.message,
                errorName: errorInfo.name,
                stack: errorInfo.stack,
                timestamp: new Date().toISOString()
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
            <span
              className="cache-time"
              title={`Last refreshed ${lastAttemptTs ? lastAttemptTs.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'n/a'} • Server cache updated ${lastUpdated ? lastUpdated.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'n/a'}`}
            >
              <Clock size={14} />
              {(lastAttemptTs || lastUpdated) ? (lastAttemptTs || lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'n/a'}
            </span>
            <button className="refresh-btn" onClick={() => fetchGrants(true)} title="Refresh grant data">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </header>
      {/* Persistent Summary Bar */}
      <div className="summary-bar" aria-live="polite">
        <div className="summary-content">
          <span className="summary-item">
            <strong>Total:</strong> {lastMeta?.totalCount ?? grants.length}
          </span>
          <span className="summary-separator">•</span>
          <span className="summary-item">
            <strong>Showing:</strong> {filteredGrants.length}
          </span>
          <span className="summary-separator">•</span>
          <span className="summary-item">
            <strong>Filters:</strong> {userType === 'county' ? 'County Dept' : userType === 'cbo' ? 'CBO' : 'All users'}, {selectedDepartment === 'all' ? 'All departments' : selectedDepartment}, Status: {(() => { const act = Object.entries(statusFilter).filter(([_k,v])=>v).map(([k])=>k); return act.length? act.map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' + ') : 'All'; })()}
          </span>
        </div>
        {/* Active filter chips in summary */}
        <div className="summary-chips">
          {searchQuery && (
            <span className="summary-chip" title="Active search filter">🔍 "{searchQuery}"</span>
          )}
          {userType !== 'all' && (
            <span className="summary-chip" title="Active user type filter">👤 {userType === 'county' ? 'County' : 'CBO'}</span>
          )}
          {selectedDepartment !== 'all' && (
            <span className="summary-chip" title="Active department filter">🏛️ {selectedDepartment}</span>
          )}
          {Object.entries(statusFilter).filter(([_k,v]) => v).map(([k]) => (
            <span key={k} className="summary-chip" title={`Active ${k} status filter`}>
              {k === 'open' ? '✅' : k === 'forecasted' ? '📅' : '🔒'} {k.charAt(0).toUpperCase() + k.slice(1)}
            </span>
          ))}
          {favoriteFilter === 'saved' && (
            <span className="summary-chip" title="Showing saved grants only">❤️ Saved</span>
          )}
          {(sourceFilters.ca === false || sourceFilters.federal === false) && (
            <span className="summary-chip" title="Source filter active">
              {sourceFilters.ca && !sourceFilters.federal ? '🏛️ CA only' : (!sourceFilters.ca && sourceFilters.federal ? '🇺🇸 Federal only' : '⚙️ Custom sources')}
            </span>
          )}
        </div>
      </div>

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

          <div className="status-toggles" role="group" aria-label="Status and favorites filter">
            {[
              { key: 'open', label: 'Open' },
              { key: 'forecasted', label: 'Forecasted' },
              { key: 'closed', label: 'Closed' }
            ].map(item => (
              <button
                key={item.key}
                className={`status-pill ${statusFilter[item.key] ? 'active' : ''}`}
                onClick={() => setStatusFilter(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                title={`${item.label} (${statusCounts[item.key] || 0})`}
                type="button"
              >
                <CheckCircle size={14} />
                <span>{item.label}</span>
                <span className="pill-count">{statusCounts[item.key] || 0}</span>
              </button>
            ))}
            <button
              className={`status-pill ${favoriteFilter === 'saved' ? 'active' : ''}`}
              onClick={() => {
                const willActivate = favoriteFilter !== 'saved';
                setFavoriteFilter(willActivate ? 'saved' : 'all');
                if (willActivate) {
                  setStatusFilter({ open: false, forecasted: false, closed: false });
                  setUserType('all');
                  setSelectedDepartment('all');
                  setSearchQuery('');
                  setSourceFilters({ ca: true, federal: true });
                }
              }}
              title={`Saved Grants (${favorites.length})`}
              type="button"
            >
              <Heart size={14} />
              <span>Saved</span>
              <span className="pill-count">{favorites.length}</span>
            </button>
          </div>

          {/* Active filter chips */}
          <div className="active-filters" aria-live="polite">
            {searchQuery && (
              <button className="filter-chip" onClick={() => setSearchQuery('')} title="Remove search filter" type="button">
                Search: "{searchQuery}" <X size={12} />
              </button>
            )}
            {userType !== 'all' && (
              <button className="filter-chip" onClick={() => setUserType('all')} title="Remove user filter" type="button">
                User: {userType === 'county' ? 'County Dept' : 'CBO'} <X size={12} />
              </button>
            )}
            {selectedDepartment !== 'all' && (
              <button className="filter-chip" onClick={() => setSelectedDepartment('all')} title="Remove department filter" type="button">
                Dept: {selectedDepartment} <X size={12} />
              </button>
            )}
            {Object.entries(statusFilter).filter(([_k,v]) => v).map(([k]) => (
              <button key={k} className="filter-chip" onClick={() => setStatusFilter(prev => ({ ...prev, [k]: false }))} title={`Remove ${k} filter`} type="button">
                {k.charAt(0).toUpperCase() + k.slice(1)} <X size={12} />
              </button>
            ))}
            {favoriteFilter === 'saved' && (
              <button className="filter-chip" onClick={() => setFavoriteFilter('all')} title="Show all grants" type="button">
                Saved <X size={12} />
              </button>
            )}
            {(sourceFilters.ca === false || sourceFilters.federal === false) && (
              <button className="filter-chip" onClick={() => setSourceFilters({ ca: true, federal: true })} title="Reset sources" type="button">
                Sources: {sourceFilters.ca && !sourceFilters.federal ? 'CA only' : (!sourceFilters.ca && sourceFilters.federal ? 'Federal only' : 'Custom')} <X size={12} />
              </button>
            )}
          </div>
        </div>
        <div className="timeline-inline">
          <div className="timeline-meta" aria-live="polite">
            <div className="source-filters" role="group" aria-label="Source filters">
              <button
                className={`source-filter-btn ${sourceFilters.ca ? 'active ca' : ''}`}
                onClick={() => setSourceFilters(prev => ({ ...prev, ca: !prev.ca }))}
                title="Toggle California grants"
                type="button"
              >
                CA: {sourceCounts.ca}
              </button>
              <span className="source-separator">•</span>
              <button
                className={`source-filter-btn ${sourceFilters.federal ? 'active federal' : ''}`}
                onClick={() => setSourceFilters(prev => ({ ...prev, federal: !prev.federal }))}
                title="Toggle Federal grants"
                type="button"
              >
                Federal: {sourceCounts.federal}
              </button>
            </div>
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
              const numAwards = parseInt((item.grant.EstAwards || '1').toString().replace(/[^0-9]/g, '') || 1);
              const perApplicantAmount = numAwards > 0 ? amount / numAwards : amount;
              
              // Determine dot size based on per-applicant award amount
              // Scaling: 18px (minimum) to 36px (maximum)
              // Expects awards from $50k to $5M per applicant
              let dotSize;
              if (perApplicantAmount >= 2000000) {
                // $2M+ per applicant = largest dots
                dotSize = 36;
              } else if (perApplicantAmount >= 1000000) {
                // $1M-$2M
                dotSize = 32;
              } else if (perApplicantAmount >= 500000) {
                // $500k-$1M
                dotSize = 28;
              } else if (perApplicantAmount >= 250000) {
                // $250k-$500k
                dotSize = 24;
              } else if (perApplicantAmount >= 100000) {
                // $100k-$250k
                dotSize = 22;
              } else if (perApplicantAmount >= 50000) {
                // $50k-$100k
                dotSize = 20;
              } else if (amount > 0) {
                // $0-$50k per applicant
                dotSize = 18;
              } else {
                // No funding info
                dotSize = 18;
              }
              const isHovered = hoveredGrantId && hoveredGrantId === item.id;
              const isSelected = selectedGrant && (selectedGrant._id || getGrantId(selectedGrant)) === item.id;
              return (
                <SmartTooltip
                  key={item.id || idx}
                  asChild
                  side="top"
                  content={(
                    <div>
                      <div className="tooltip-title">{item.grant.Title || item.grant.GrantTitle}</div>
                      <div className="tooltip-detail">
                        <Calendar size={12} /> {formatDeadline(item.grant.ApplicationDeadline, item.grant._deadlineLabel)}
                      </div>
                      <div className="tooltip-detail">
                        <DollarSign size={12} /> Total: {formatCurrency(item.grant.EstAvailFunds)}
                      </div>
                      {numAwards > 0 && (
                        <div className="tooltip-detail" style={{ fontSize: '0.7rem', color: '#b0d4f1' }}>
                          Per Award: {formatCurrency(perApplicantAmount.toString())} ({numAwards} award{numAwards !== 1 ? 's' : ''})
                        </div>
                      )}
                      <div className="tooltip-detail">
                        <FileText size={12} /> {item.grant.AgencyName}
                      </div>
                    </div>
                  )}
                >
                  <div 
                    className={`timeline-dot ${isHovered || isSelected ? 'active' : ''}`}
                    style={{ 
                      left: `${leftPos}%`,
                      background: dotColor,
                      width: `${dotSize}px`,
                      height: `${dotSize}px`
                    }}
                    onClick={() => handleGrantSelect(item.grant)}
                    onMouseEnter={() => setHoveredGrantId(item.id)}
                    onMouseLeave={() => setHoveredGrantId(null)}
                  />
                </SmartTooltip>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`main-content ${selectedGrant ? 'split-view' : ''}`}
        ref={mainContentRef}
        style={selectedGrant ? { userSelect: isResizing ? 'none' : 'auto' } : undefined}
      >
        {/* Grants Table */}
        <div
          className="table-container"
          style={selectedGrant ? { flex: `0 0 ${splitWidth}%` } : undefined}
        >
          <table className="grants-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')} className="sortable">
                  <span className="th-content">
                    Grant Title {sortColumn === 'title' && (sortDirection === 'asc' ? '▲' : '▼')}
                    <InfoTooltip text="The title of the grant opportunity." />
                  </span>
                </th>
                <th onClick={() => handleSort('amount')} className="sortable">
                  <span className="th-content">
                    <DollarSign size={14} /> Amount {sortColumn === 'amount' && (sortDirection === 'asc' ? '▲' : '▼')}
                    <InfoTooltip text="Total Estimated Available Funding: The total projected dollar amount of the grant." />
                  </span>
                </th>
                <th onClick={() => handleSort('deadline')} className="sortable">
                  <span className="th-content">
                    <Calendar size={14} /> Deadline {sortColumn === 'deadline' && (sortDirection === 'asc' ? '▲' : '▼')}
                    <InfoTooltip text="Application Deadline: The date by which all applications must be submitted to the grantmaker." />
                  </span>
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  <span className="th-content">
                    <CheckCircle size={14} /> Status {sortColumn === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                    <InfoTooltip text="Forecasted: Planned but not yet open. Active/Open: Currently accepting applications. Closed: No longer accepting applications." />
                  </span>
                </th>
                <th className="save-col">Save</th>
              </tr>
            </thead>
            <tbody>
              {grantsWithEmphasis.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-results-row">
                    <AlertCircle size={24} />
                    <div>
                      <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>No grants found matching your criteria</div>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        Total grants loaded: {grants.length} • 
                        Active filters: {selectedDepartment !== 'all' ? `Department: ${departments[selectedDepartment]?.name}` : 'All departments'} • 
                        Status: {(() => { const act = Object.entries(statusFilter).filter(([_k,v])=>v).map(([k])=>k); return act.length? act.map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' + ') : 'All'; })()}
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
                  const rowId = getGrantId(grant);
                  const selectedId = selectedGrant ? getGrantId(selectedGrant) : null;
                  const statusBadge = getStatusBadge(grant.Status, grant.ApplicationDeadline);
                  const rowClasses = [
                    selectedId && rowId === selectedId ? 'selected' : '',
                    !grant._matchesDept ? 'non-match' : '',
                    grant._isTooSoon ? 'too-soon' : ''
                  ].filter(Boolean).join(' ');
                  
                  return (
                    <tr 
                      key={rowId}
                      className={rowClasses}
                      data-grant-id={rowId}
                      ref={(el) => {
                        if (el) rowRefs.current[rowId] = el; else delete rowRefs.current[rowId];
                      }}
                      onClick={() => handleGrantSelect(grant)}
                      onMouseEnter={() => setHoveredGrantId(rowId)}
                      onMouseLeave={() => setHoveredGrantId(null)}
                    >
                      <td className="grant-title-cell">
                        <div className="title-text">
                          <span className={`title-prefix ${grant._source === 'grants.gov' ? 'federal' : 'state'}`}>
                            {grant._source === 'grants.gov' ? 'FED' : 'CA'}
                          </span>
                          <span className="title-line">{grant.Title || grant.GrantTitle || 'Untitled Grant'}</span>
                        </div>
                        <div className="categories-text">{grant.Categories}</div>
                      </td>
                      <td className="amount-cell">
                        <div className="amount-primary">{formatCurrency(grant.EstAvailFunds)}</div>
                        {(grant.AwardFloor || grant.AwardCeiling) && (
                          <div className="amount-range" title="Individual award range per applicant">
                            {grant.AwardFloor ? formatCurrency(String(grant.AwardFloor)) : 'Min N/A'}
                            <span className="amount-sep">–</span>
                            {grant.AwardCeiling ? formatCurrency(String(grant.AwardCeiling)) : 'Max N/A'}
                          </div>
                        )}
                      </td>
                      <td className="deadline-cell">
                        {formatDeadline(grant.ApplicationDeadline, grant._deadlineLabel)}
                      </td>
                      <td className="status-cell">
                        <span className="status-badge" style={{ background: statusBadge.color }}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="save-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`heart-btn ${favorites.includes(rowId) ? 'active' : ''}`}
                          aria-label="Save to favorites"
                          onClick={() => {
                            setFavorites((prev) => {
                              if (prev.includes(rowId)) {
                                return prev.filter((id) => id !== rowId);
                              }
                              return [...prev, rowId];
                            });
                          }}
                        >
                          {favorites.includes(rowId) ? (
                            <span style={{ color: '#dc3545', fontSize: '16px' }}>❤️</span>
                          ) : (
                            <Heart size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Drag handle between list and details */}
        {selectedGrant && (
          <div
            className={`split-resizer ${isResizing ? 'active' : ''}`}
            role="separator"
            aria-label="Resize details panel"
            aria-orientation="vertical"
            onMouseDown={(event) => {
              event.preventDefault();
              setIsResizing(true);
            }}
          />
        )}

        {/* Grant Details Panel */}
        {selectedGrant && (
          <div
            className="detail-panel"
            style={selectedGrant ? { flex: `0 0 ${100 - splitWidth}%` } : undefined}
          >
            <div className="detail-header">
              <h2>{selectedGrant.Title || selectedGrant.GrantTitle}</h2>
              <button className="close-btn" onClick={() => handleGrantSelect(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-meta">
                <span className="meta-source" title="Source">
                  {selectedGrant._source === 'grants.gov' ? 'Federal (Grants.gov)' : 'California State'}
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-amount" title="Estimated Available Funds">{formatCurrency(selectedGrant.EstAvailFunds)}</span>
                <span className="meta-separator">•</span>
                <span className="meta-deadline" title="Application Deadline">
                  <span className="deadline-pill">Deadline: {formatDeadlineDetailed(selectedGrant.ApplicationDeadline, selectedGrant._deadlineLabel)}</span>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-status" title="Status">
                  <span className="status-dot" style={{ background: getStatusBadge(selectedGrant.Status, selectedGrant.ApplicationDeadline).color }} />
                  {getStatusBadge(selectedGrant.Status, selectedGrant.ApplicationDeadline).text}
                </span>
              </div>

              {(selectedGrant.OpportunityNumber || selectedGrant.ALN) && (
                <div className="detail-quick">
                  {selectedGrant.OpportunityNumber && (
                    <span className="quick-pill" title="Opportunity Number">Opp #{selectedGrant.OpportunityNumber}</span>
                  )}
                  {selectedGrant.ALN && (
                    <span className="quick-pill" title="Assistance Listing Number">ALN {selectedGrant.ALN}</span>
                  )}
                </div>
              )}

              <div className="detail-inline-grid">
                <div className="inline-item" title="Expected Number of Awards">
                  <span className="inline-label">
                    Awards <InfoTooltip text="Expected Number of Awards: A single grant may represent one or many awards. Some grantmakers determine the exact number in advance, while others indicate a range." />
                  </span>
                  <span className="inline-value">
                    {selectedGrant.ExpectedAwards != null && selectedGrant.ExpectedAwards !== '' 
                      ? selectedGrant.ExpectedAwards 
                      : selectedGrant.EstAwards || 'N/A'}
                  </span>
                </div>
                {selectedGrant.AwardCeiling ? (
                  <div className="inline-item" title="Award Ceiling">
                    <span className="inline-label">Award Ceiling</span>
                    <span className="inline-value">{formatCurrency(String(selectedGrant.AwardCeiling))}</span>
                  </div>
                ) : null}
                {selectedGrant.AwardFloor ? (
                  <div className="inline-item" title="Award Floor">
                    <span className="inline-label">Award Floor</span>
                    <span className="inline-value">{formatCurrency(String(selectedGrant.AwardFloor))}</span>
                  </div>
                ) : null}
                {selectedGrant.PostedDate && (
                  <div className="inline-item" title="Posted">
                    <span className="inline-label">Posted</span>
                    <span className="inline-value">{new Date(selectedGrant.PostedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {(selectedGrant.CategoryName || selectedGrant.Category || selectedGrant.Categories) && (
                  <div className="inline-item" title="Funding Category">
                    <span className="inline-label">Category</span>
                    <span className="inline-value">{selectedGrant.CategoryName || selectedGrant.Category || selectedGrant.Categories}</span>
                  </div>
                )}
                {selectedGrant.DocumentType && (
                  <div className="inline-item" title="Document Type">
                    <span className="inline-label">Document Type</span>
                    <span className="inline-value">{selectedGrant.DocumentType}</span>
                  </div>
                )}
                {selectedGrant.AgencyCode && (
                  <div className="inline-item" title="Agency Code">
                    <span className="inline-label">Agency Code</span>
                    <span className="inline-value">{selectedGrant.AgencyCode}</span>
                  </div>
                )}
                <div className="inline-item" title="Eligible Applicants">
                  <span className="inline-label">
                    Applicants <InfoTooltip text="Eligible Applicants: Who can apply for this grant, including nonprofit organizations, public agencies, businesses, individuals, tribal governments, or other legal entities." />
                  </span>
                  <span className="inline-value">{selectedGrant.ApplicantType || 'N/A'}</span>
                </div>
                {(selectedGrant.OpportunityID || selectedGrant.PortalID) && (
                  <div className="inline-item" title="Source IDs">
                    <span className="inline-label">IDs</span>
                    <span className="inline-value">
                      {selectedGrant.OpportunityID ? `OppID ${selectedGrant.OpportunityID}` : ''}
                      {selectedGrant.OpportunityID && selectedGrant.PortalID ? ' · ' : ''}
                      {selectedGrant.PortalID ? `Portal ${selectedGrant.PortalID}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {(selectedGrant.Purpose || selectedGrant.Description || selectedGrant.Source === 'Federal') && (
                <div className="detail-text-stack">
                  {selectedGrant.Purpose && (
                    <div className="text-section" title="Purpose">
                      <div className="text-heading">
                        Purpose <InfoTooltip text="The grant purpose answers why the grant exists—what the grantmaker intends to achieve, its goals and desired outcomes." />
                      </div>
                      <FormattedText text={selectedGrant.Purpose} query={searchQuery} />
                    </div>
                  )}
                  {loadingGrantDetails ? (
                    <div className="text-section" title="Loading Description">
                      <div className="text-heading">
                        Description <InfoTooltip text="A detailed summary covering project scope, covered activities, eligibility exclusions, timeline, announcement mechanism, and past/average awards." />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        <Clock size={16} className="spin" />
                        Loading full description from Grants.gov...
                      </div>
                    </div>
                  ) : selectedGrant.Description ? (
                    <div className="text-section" title="Description">
                      <div className="text-heading">
                        Description <InfoTooltip text="A detailed summary covering project scope, covered activities, eligibility exclusions, timeline, announcement mechanism, and past/average awards." />
                      </div>
                      <FormattedText text={selectedGrant.Description} query={searchQuery} />
                    </div>
                  ) : selectedGrant.Source === 'Federal' ? (
                    <div className="text-section" title="Description">
                      <div className="text-heading">
                        Description <InfoTooltip text="Federal grant descriptions are available on the grant detail page. Click the 'View Full Grant Details' button below." />
                      </div>
                      <div style={{ color: '#6c757d', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        Description could not be loaded automatically. Click "View Full Grant Details" below to see complete information on Grants.gov.
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {buildGrantLink(selectedGrant) && (
                <div className="detail-actions tight">
                  <a 
                    href={buildGrantLink(selectedGrant)} 
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

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .dashboard {
          height: 100vh;
          width: 100vw;
          background: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          overflow: hidden;
          display: flex;
          flex-direction: column;
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
        .summary-bar {
          background: #e9ecef;
          border-bottom: 1px solid #d1d5db;
          padding: 0.5rem 2rem;
        }
        .summary-content {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          color: #333;
          font-size: 0.9rem;
          margin-bottom: 0.35rem;
        }
        .summary-item strong {
          color: #0d1b2a;
        }
        .summary-separator {
          color: #6c757d;
        }
        .summary-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .summary-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0.2rem 0.5rem;
          background: rgba(139, 21, 56, 0.15);
          border: 1px solid rgba(139, 21, 56, 0.3);
          border-radius: 999px;
          font-size: 0.75rem;
          color: #333;
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
        .active-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.25rem;
        }
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.25rem 0.6rem;
          border: 1px solid #d1d5db;
          background: #f8f9fa;
          color: #212529;
          border-radius: 999px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .filter-chip:hover {
          border-color: #1b4965;
          color: #1b4965;
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
        .source-filters {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .source-filter-btn {
          border: 1px solid transparent;
          background: #f4f6f8;
          color: #334155;
          padding: 0.28rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
        }
        .source-filter-btn:hover {
          background: #e9edf2;
        }
        .source-filter-btn.active.ca {
          background: #e4f4f0;
          color: #0f6d5f;
          border-color: #b9e3d8;
        }
        .source-filter-btn.active.federal {
          background: #e6f0ff;
          color: #0b3d91;
          border-color: #b6cffc;
        }
        .source-separator {
          color: #adb5bd;
          margin: 0 2px;
        }
        .timeline {
          position: relative;
          height: 80px;
          margin: 0.6rem 0;
          display: flex;
          align-items: center;
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
        /* timeline tooltips now use SmartTooltip (Floating UI) */
        .tooltip-title {
          font-weight: 700;
          margin-bottom: 0.15rem;
          color: white;
          font-size: 0.7rem;
        }
        .tooltip-detail {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.15rem;
          color: #c5d5f2;
          font-size: 0.65rem;
        }
        .tooltip-detail svg {
          flex-shrink: 0;
        }

        /* Main Content */
        .main-content {
          display: flex;
          flex: 1;
          min-height: 0;
          background: #f5f5f5;
          position: relative;
          overflow: hidden;
        }
        .main-content.split-view .table-container {
          flex: 0 0 50%;
        }
        .table-container {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: auto;
          background: white;
          border-right: 1px solid #d1d5db;
          height: 100%;
        }
        .split-resizer {
          flex: 0 0 12px;
          cursor: col-resize;
          background: linear-gradient(180deg, #f5f7fa 0%, #e5e9f0 100%);
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          position: relative;
          transition: background 0.15s ease, box-shadow 0.15s ease;
          z-index: 20;
        }
        .split-resizer::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 4px;
          height: 32px;
          border-radius: 999px;
          background: #b0b7c3;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }
        .split-resizer:hover,
        .split-resizer.active {
          background: linear-gradient(180deg, #eef2f7 0%, #e1e5ec 100%);
          box-shadow: inset 0 0 0 1px rgba(27, 73, 101, 0.2), 0 0 0 1px rgba(27, 73, 101, 0.08);
        }
        .split-resizer.active::after {
          background: #8b1538;
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
        .grants-table th .th-content {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
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
        @keyframes highlight-flash {
          0% { background: #fffacd; }
          50% { background: #fff9c4; }
          100% { background: #e3f2fd; }
        }
        .grants-table tbody tr.selected {
          background: #e3f2fd;
          border-left: 3px solid #1b4965;
          animation: highlight-flash 0.8s ease-out;
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
        .title-prefix {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 46px;
          padding: 0.12rem 0.35rem;
          margin-right: 0.35rem;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.4px;
          border: 1px solid transparent;
          border-radius: 3px;
        }
        .title-prefix.federal {
          background: #e6f0ff;
          color: #0b3d91;
          border-color: #b6cffc;
        }
        .title-prefix.state {
          background: #e4f4f0;
          color: #0f6d5f;
          border-color: #b9e3d8;
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
        .amount-primary {
          font-size: 0.95rem;
        }
        .amount-range {
          margin-top: 3px;
          font-size: 0.76rem;
          font-weight: 500;
          color: #6c757d;
          display: block;
        }
        .amount-range::before {
          content: "Per applicant: ";
          font-weight: 600;
          color: #495057;
        }
        .amount-sep {
          color: #adb5bd;
          margin: 0 2px;
        }
        .deadline-cell {
          white-space: nowrap;
          color: #495057;
          max-width: 140px;
          font-size: 0.85rem;
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
          min-height: 0;
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
          padding: 0.4rem 0.65rem;
          background: #f4f6f8;
          border: 1px solid #dfe4ea;
          border-radius: 3px;
          font-size: 0.8rem;
          font-weight: 500;
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
          margin-right: 6px;
        }
        .detail-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.8rem;
          color: #0d1b2a;
          background: transparent;
          border: none;
          padding: 0;
          border-radius: 0;
        }
        .detail-meta > span:not(.meta-separator) {
          background: #f4f6f8;
          border: 1px solid #dfe4ea;
          border-radius: 3px;
          padding: 0.4rem 0.65rem;
          font-weight: 500;
        }
        .detail-meta .meta-note {
          background: #eef2f6;
          border: 1px dashed #d0d7e2;
          color: #4b5563;
          font-size: 0.75rem;
          padding: 0.3rem 0.55rem;
        }
        .detail-meta .meta-source { font-weight: 700; }
        .detail-meta .meta-amount { font-weight: 700; color: #8b1538; }
        .detail-meta .meta-deadline { font-weight: 600; color: #1b4965; }
        .detail-meta .meta-separator { color: #adb5bd; margin: 0 0.1rem; }
        .detail-meta .meta-status { display: inline-flex; align-items: center; font-weight: 600; }
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
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
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
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .text-section p {
          margin: 0.5rem 0 0 0;
          line-height: 1.45;
          color: #495057;
          font-size: 0.95rem;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .text-section p:first-of-type {
          margin-top: 0;
        }
        .text-section a {
          color: #1b4965;
          text-decoration: underline;
          font-weight: 500;
          cursor: pointer;
        }
        .text-section a:hover {
          color: #0d1b2a;
          text-decoration-thickness: 2px;
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

        /* Loading */
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
        .spinner, .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .main-content {
            flex-direction: column;
            height: auto;
            min-height: 0;
          }
          .main-content.split-view {
            flex-direction: column;
          }
          .main-content.split-view .table-container,
          .detail-panel {
            flex: 1 1 auto;
            max-height: none;
          }
          .detail-panel {
            position: relative;
            top: auto;
          }
          .split-resizer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CalaverasGrantsDashboard;
