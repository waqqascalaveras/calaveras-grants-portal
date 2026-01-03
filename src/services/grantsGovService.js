// Grants.gov API service

const API_BASE_URL = 'https://api.grants.gov/v1/api';
const CACHE_KEY = 'grantsGovCache';
const CACHE_TIME_KEY = 'grantsGovCacheTime';
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Search for opportunities on Grants.gov
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>} Array of grant opportunities
 */
export const searchGrantsGov = async (params = {}) => {
  const defaultParams = {
    rows: 1000, // Get more grants
    keyword: '',
    oppNum: '',
    eligibilities: '01', // County governments
    agencies: '',
    oppStatuses: 'forecasted|posted', // Only active opportunities
    aln: '',
    fundingCategories: ''
  };

  const searchParams = { ...defaultParams, ...params };

  try {
    // eslint-disable-next-line no-console
    console.log('[Grants.gov] Searching with params:', searchParams);
    
    const response = await fetch(`${API_BASE_URL}/search2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      throw new Error(`Grants.gov API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errorcode !== 0) {
      throw new Error(`Grants.gov API error: ${result.msg}`);
    }

    // eslint-disable-next-line no-console
    console.log(`[Grants.gov] Found ${result.data.hitCount} opportunities`);
    return result.data.oppHits || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Grants.gov] Search error:', error);
    throw error;
  }
};

/**
 * Fetch detailed opportunity information
 * @param {string|number} opportunityId - Opportunity ID
 * @returns {Promise<Object>} Detailed opportunity data
 */
export const fetchOpportunityDetails = async (opportunityId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/fetchOpportunity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ opportunityId })
    });

    if (!response.ok) {
      throw new Error(`Grants.gov API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errorcode !== 0) {
      throw new Error(`Grants.gov API error: ${result.msg}`);
    }

    return result.data;
  } catch (error) {
    console.error('[Grants.gov] Fetch opportunity error:', error);
    throw error;
  }
};

/**
 * Normalize Grants.gov opportunity to match CA grants portal format
 * @param {Object} opp - Grants.gov opportunity object
 * @returns {Object} Normalized grant object
 */
export const normalizeGrantsGovData = (opp) => {
  return {
    // Source identification
    _source: 'grants.gov',
    _sourceId: opp.id,
    
    // Standard fields (matching CA portal)
    PortalID: `gov-${opp.id}`,
    GrantID: opp.number,
    Title: opp.title,
    GrantTitle: opp.title,
    
    AgencyName: opp.agencyName,
    AgencyCode: opp.agencyCode,
    
    Status: opp.oppStatus === 'posted' ? 'Open' : 
            opp.oppStatus === 'forecasted' ? 'Forecasted' : 
            opp.oppStatus === 'closed' ? 'Closed' : 
            opp.oppStatus,
    
    ApplicationDeadline: opp.closeDate || null,
    PostedDate: opp.openDate,
    
    Categories: opp.fundingCategories?.join('; ') || '',
    
    // Grants.gov specific fields
    DocumentType: opp.docType,
    OpportunityNumber: opp.number,
    
    // ALN (Assistance Listing Numbers)
    ALN: opp.alnist?.join(', ') || '',
    
    // Applicant eligibility - assume county eligible if in results
    ApplicantType: 'County governments; Local Government; Public Agency',
    
    // Placeholder fields
    Purpose: `Federal grant opportunity from ${opp.agencyName}`,
    Description: opp.title,
    EstAvailFunds: 'TBD',
    EstAwards: 'TBD',
    
    GrantInfoURL: `https://www.grants.gov/web/grants/view-opportunity.html?oppId=${opp.id}`
  };
};

/**
 * Get cached Grants.gov data
 * @returns {Object|null} Cached data or null
 */
export const getCachedGrantsGov = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheTimestamp = localStorage.getItem(CACHE_TIME_KEY);
    
    if (!cachedData || !cacheTimestamp) return null;
    
    const now = Date.now();
    const age = now - parseInt(cacheTimestamp);
    
    if (age >= CACHE_DURATION) return null;
    
    return {
      data: JSON.parse(cachedData),
      timestamp: new Date(parseInt(cacheTimestamp))
    };
  } catch (error) {
    console.error('[Grants.gov] Error reading cache:', error);
    return null;
  }
};

/**
 * Cache Grants.gov data
 * @param {Array} grants - Grant records to cache
 */
export const cacheGrantsGov = (grants) => {
  try {
    const now = Date.now();
    // Cache only essential fields to reduce storage
    const essentialOnly = grants.map(g => ({
      OpportunityID: g.OpportunityID,
      Title: g.Title,
      AgencyName: g.AgencyName,
      EstAvailFunds: g.EstAvailFunds,
      ApplicationDeadline: g.ApplicationDeadline,
      Status: g.Status,
      Categories: g.Categories,
      ApplicantType: g.ApplicantType,
      _source: g._source
    }));
    localStorage.setItem(CACHE_KEY, JSON.stringify(essentialOnly));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // eslint-disable-next-line no-console
      console.warn('[Grants.gov] Cache quota exceeded, clearing old cache...');
      try {
        // Clear old caches to make room
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIME_KEY);
        localStorage.removeItem('calaverrasGrantsCache');
        localStorage.removeItem('calaverrasGrantsCacheTime');
        // Retry with essential fields only
        const essentialRetry = grants.map(g => ({
          OpportunityID: g.OpportunityID,
          Title: g.Title,
          AgencyName: g.AgencyName,
          EstAvailFunds: g.EstAvailFunds,
          ApplicationDeadline: g.ApplicationDeadline,
          Status: g.Status,
          Categories: g.Categories,
          ApplicantType: g.ApplicantType,
          _source: g._source
        }));
        localStorage.setItem(CACHE_KEY, JSON.stringify(essentialRetry));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        // eslint-disable-next-line no-console
        console.log('[Grants.gov] Retried caching with essential fields only');
      } catch (retryError) {
        // eslint-disable-next-line no-console
        console.warn('[Grants.gov] Cache still failed after clearing, proceeding without cache');
      }
    } else {
      // eslint-disable-next-line no-console
      console.error('[Grants.gov] Error saving to cache:', error);
    }
  }
};

/**
 * Get Grants.gov opportunities with caching and normalization
 * @returns {Promise<Array>} Normalized grant objects
 */
export const getGrantsGovOpportunities = async () => {
  // Try cache first
  const cached = getCachedGrantsGov();
  if (cached) {
    // eslint-disable-next-line no-console
    console.log('[Grants.gov] Using cached data');
    return cached.data;
  }
  
  // Fetch fresh data
  const opportunities = await searchGrantsGov({
    eligibilities: '01', // County governments
    oppStatuses: 'forecasted|posted'
  });
  
  // Normalize data
  const normalized = opportunities.map(normalizeGrantsGovData);
  
  // Cache normalized data
  cacheGrantsGov(normalized);
  
  return normalized;
};

/**
 * Clear Grants.gov cache
 */
export const clearGrantsGovCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
};
