// Formatting utility functions

/**
 * Format currency amount
 * @param {string} amount - Amount string from API
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount) return 'Not specified';
  const num = parseInt(amount.replace(/[^0-9]/g, ''));
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  }).format(num);
};

/**
 * Format date string
 * @param {string} dateStr - Date string from API
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'Not specified';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return dateStr;
  }
};

/**
 * Format time for cache display
 * @param {Date} date - Date object
 * @returns {string} - Formatted time string
 */
export const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Decode common HTML entities found in API strings
 * @param {string} str - Input string possibly containing HTML entities
 * @returns {string} - Decoded string
 */
export const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&#39;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—');
};
/**
 * Pre-process grant descriptions to improve formatting
 * Adds line breaks before bullet points (•) and numbered lists (1., 2., etc.)
 * unless they appear at the very beginning of the text
 * @param {string} text - Raw description text
 * @returns {string} - Formatted description text
 */
export const preprocessDescription = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  let result = text;
  
  // Add line break before bullet points (•) unless at the beginning
  result = result.replace(/([^\n])(\s*•)/g, '$1\n$2');
  
  // Add line break before numbered lists (1., 2., etc.) unless at the beginning
  // Pattern: not at start of line + optional spaces + digit(s) + period + space
  result = result.replace(/([^\n])(\s*)(\d+\.)\s/g, '$1\n$2$3 ');
  
  return result;
};