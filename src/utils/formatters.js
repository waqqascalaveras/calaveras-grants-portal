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
