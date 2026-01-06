// Unified grant data service with server-side + client-side caching
// Server-side: GitHub Actions fetches CA + Federal, deduplicates, saves to static JSON
// Client-side: Browser caches for fast filtering/sorting/searching
// Stable cache filename; schema changes handled via cache-busting query + defensive parsing
const UNIFIED_CACHE_URL = `${process.env.PUBLIC_URL || ''}/grants-cache.json`;
const CLIENT_CACHE_KEY = 'grantsClientCache';
const CLIENT_CACHE_TIME_KEY = 'grantsClientCacheTime';
const CLIENT_CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Get cached grants from browser localStorage
 * @returns {Object|null} Cached data or null
 */
export const getClientCache = () => {
  try {
    const cachedData = localStorage.getItem(CLIENT_CACHE_KEY);
    const cacheTimestamp = localStorage.getItem(CLIENT_CACHE_TIME_KEY);
    
    if (!cachedData || !cacheTimestamp) return null;
    
    const now = Date.now();
    const age = now - parseInt(cacheTimestamp);
    
    if (age >= CLIENT_CACHE_DURATION) return null;
    
    return {
      data: JSON.parse(cachedData),
      timestamp: new Date(parseInt(cacheTimestamp)),
      age: Math.floor(age / 1000 / 60) // minutes
    };
  } catch (error) {
    console.error('[Client Cache] Error reading cache:', error);
    return null;
  }
};

/**
 * Save grants to browser localStorage
 * @param {Object} data - Grant data to cache
 */
export const saveClientCache = (data) => {
  try {
    const now = Date.now();
    localStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CLIENT_CACHE_TIME_KEY, now.toString());
    // eslint-disable-next-line no-console
    console.log('[Client Cache] Saved to browser localStorage');
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // eslint-disable-next-line no-console
      console.warn('[Client Cache] Storage quota exceeded, clearing old cache...');
      try {
        // Clear old caches
        localStorage.removeItem(CLIENT_CACHE_KEY);
        localStorage.removeItem(CLIENT_CACHE_TIME_KEY);
        localStorage.removeItem('calaverrasGrantsCache');
        localStorage.removeItem('calaverrasGrantsCacheTime');
        localStorage.removeItem('grantsGovCache');
        localStorage.removeItem('grantsGovCacheTime');
        
        // Retry save
        localStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CLIENT_CACHE_TIME_KEY, Date.now().toString());
      } catch (retryError) {
        // eslint-disable-next-line no-console
        console.warn('[Client Cache] Unable to save cache, continuing without it');
      }
    }
  }
};

/**
 * Clear client cache
 */
export const clearClientCache = () => {
  localStorage.removeItem(CLIENT_CACHE_KEY);
  localStorage.removeItem(CLIENT_CACHE_TIME_KEY);
  // eslint-disable-next-line no-console
  console.log('[Client Cache] Cleared');
};

/**
 * Fetch unified grants from server-side cache
 * Automatically caches in browser for fast client-side operations
 * @param {boolean} forceRefresh - Skip client cache and fetch fresh
 * @returns {Promise<Object>} Grants data with metadata
 */
export const getUnifiedGrants = async (forceRefresh = false) => {
  // Try client cache first (fast!)
  if (!forceRefresh) {
    const clientCache = getClientCache();
    const cacheData = clientCache?.data;
    const cacheGrants = cacheData?.grants;
    const cacheOk = cacheData?.success === true && Array.isArray(cacheGrants) && cacheGrants.length > 0;
    if (clientCache && cacheOk) {
      // eslint-disable-next-line no-console
      console.log(`[Unified Grants] Using client cache (${clientCache.age} minutes old)`);
      return cacheData;
    }
    if (clientCache && !cacheOk) {
      // eslint-disable-next-line no-console
      console.warn('[Unified Grants] Skipping client cache (empty or unsuccessful); fetching fresh');
    }
  }
  
  try {
    // eslint-disable-next-line no-console
    console.log('[Unified Grants] Fetching from server cache...');
    
    // Add cache-busting parameter to ensure fresh data from server
    const cacheBuster = `t=${Date.now()}`;
    const response = await fetch(`${UNIFIED_CACHE_URL}?${cacheBuster}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch unified cache: ${response.status} ${response.statusText}`);
    }
    
    let rawData;
    try {
      rawData = await response.json();
    } catch (parseErr) {
      throw new Error(`Failed to parse cache JSON: ${parseErr?.message || 'unknown error'}`);
    }

    // Validate core structure
    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Cache is not a valid JSON object');
    }

    if (!Array.isArray(rawData?.grants)) {
      throw new Error(`Invalid grants array: expected array, got ${typeof rawData?.grants}`);
    }

    // Warn if cache build failed but continue with available data
    if (rawData.success === false) {
      // eslint-disable-next-line no-console
      console.warn('[Unified Grants] Cache marked unsuccessful (API fetch may have failed); using available data');
    }

    // Defensive normalization: handle missing/malformed fields gracefully
    const grants = Array.isArray(rawData.grants) ? rawData.grants : [];
    const sources = rawData?.sources || {};
    const duplicates = rawData?.duplicates || {};

    const data = {
      ...rawData,
      success: rawData.success === true,
      grants: grants,
      totalCount: typeof rawData.totalCount === 'number' ? rawData.totalCount : grants.length,
      fetchedAt: rawData.fetchedAt || new Date().toISOString(),
      sources: {
        ca: {
          count: typeof sources?.ca?.count === 'number' ? sources.ca.count : 0,
          success: sources?.ca?.success === true
        },
        federal: {
          count: typeof sources?.federal?.count === 'number' ? sources.federal.count : 0,
          success: sources?.federal?.success === true
        }
      },
      duplicates: {
        count: typeof duplicates?.count === 'number' ? duplicates.count : 0,
        examples: Array.isArray(duplicates?.examples) ? duplicates.examples.slice(0, 10) : []
      }
    };
    
    // eslint-disable-next-line no-console
    console.log(
      `[Unified Grants] Loaded ${data.totalCount} grants ` +
      `(CA: ${data.sources.ca.count}, Federal: ${data.sources.federal.count}, ` +
      `Duplicates removed: ${data.duplicates.count})`
    );
    
    // Save to client cache for fast subsequent operations
    saveClientCache(data);
    
    return data;
    
  } catch (error) {
    const errorMsg = error?.message || 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('[Unified Grants] Error fetching:', errorMsg, error?.stack);
    
    // Try client cache as fallback even if expired
    const staleCache = getClientCache();
    if (staleCache) {
      // eslint-disable-next-line no-console
      console.warn('[Unified Grants] Using stale client cache as fallback');
      return staleCache.data;
    }
    
    // If all else fails, log and re-throw
    // eslint-disable-next-line no-console
    console.error('[Unified Grants] No fallback cache available, throwing error');
    throw error;
  }
};

/**
 * Get cache metadata
 * @returns {Object} Cache info
 */
export const getCacheInfo = () => {
  const clientCache = getClientCache();
  
  return {
    hasClientCache: clientCache !== null,
    clientCacheAge: clientCache ? clientCache.age : null,
    clientCacheTimestamp: clientCache ? clientCache.timestamp : null,
    clientCacheDuration: CLIENT_CACHE_DURATION
  };
};

// Export for backward compatibility (will use unified service)
export const getGrants = getUnifiedGrants;
export const clearCache = clearClientCache;
