// Grant data service with caching

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://data.ca.gov/api/3/action';
const RESOURCE_ID = process.env.REACT_APP_RESOURCE_ID || '111c8c88-21f6-453c-ae2c-b4785a0624f5';
const CACHE_DURATION = parseInt(process.env.REACT_APP_CACHE_DURATION) || 43200000; // 12 hours default

const CACHE_KEY = 'calaverrasGrantsCache';
const CACHE_TIME_KEY = 'calaverrasGrantsCacheTime';

/**
 * Fetch grants from CA state portal API
 * @returns {Promise<Array>} Array of grant records
 */
export const fetchGrants = async () => {
  const response = await fetch(
    `${API_BASE_URL}/datastore_search?resource_id=${RESOURCE_ID}&limit=10000`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch grant data');
  }
  
  const data = await response.json();
  return data.result.records;
};

/**
 * Get cached grants data
 * @returns {Object|null} Cached data or null if invalid
 */
export const getCachedGrants = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheTimestamp = localStorage.getItem(CACHE_TIME_KEY);
    
    if (!cachedData || !cacheTimestamp) return null;
    
    const now = Date.now();
    const age = now - parseInt(cacheTimestamp);
    
    // Return null if cache is too old
    if (age >= CACHE_DURATION) return null;
    
    return {
      data: JSON.parse(cachedData),
      timestamp: new Date(parseInt(cacheTimestamp))
    };
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

/**
 * Save grants to cache
 * @param {Array} grants - Grant records to cache
 */
export const cacheGrants = (grants) => {
  try {
    const now = Date.now();
    localStorage.setItem(CACHE_KEY, JSON.stringify(grants));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

/**
 * Clear grants cache
 */
export const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
};

/**
 * Get grants with automatic caching
 * @returns {Promise<Object>} Object with grants array and timestamp
 */
export const getGrants = async () => {
  // Try cache first
  const cached = getCachedGrants();
  if (cached) {
    return cached;
  }
  
  // Fetch fresh data
  const grants = await fetchGrants();
  cacheGrants(grants);
  
  return {
    data: grants,
    timestamp: new Date()
  };
};
