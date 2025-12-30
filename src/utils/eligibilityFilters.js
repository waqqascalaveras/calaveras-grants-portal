// Utility functions for eligibility filtering

/**
 * Check if a grant is eligible for county government application
 * @param {Object} grant - Grant record from CA grants portal
 * @returns {boolean} - True if county eligible
 */
export const isEligibleForCounty = (grant) => {
  const applicantType = grant.ApplicantType?.toLowerCase() || '';
  // If ApplicantType is missing/empty, treat as eligible
  if (!grant.ApplicantType || !applicantType.trim()) return true;

  const eligibleTypes = [
    'public agency',
    'county',
    'local government',
    'government',
    'tribal government'
  ];
  const restrictedTypes = [
    'individual only',
    'business only',
    'nonprofit only'
  ];
  const hasEligibleType = eligibleTypes.some(type => applicantType.includes(type));
  const hasRestrictedType = restrictedTypes.some(type => applicantType.includes(type));
  return hasEligibleType || (!hasRestrictedType && applicantType.length > 0);
};

/**
 * Check if grant is recently closed (within 30 days)
 * @param {Object} grant - Grant record
 * @returns {boolean} - True if recently closed
 */
export const isRecentlyClosed = (grant, daysThreshold = 30) => {
  if (grant.Status?.toLowerCase() !== 'closed') return false;

  const deadline = grant.ApplicationDeadline;
  if (!deadline) return false;

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate)) return false;

  const now = new Date();
  const thresholdAgo = new Date(now.getTime() - (daysThreshold * 24 * 60 * 60 * 1000));
  return deadlineDate >= thresholdAgo;
};

/**
 * Match grant to department based on keywords
 * @param {Object} grant - Grant record
 * @param {string} deptKey - Department key
 * @param {Object} departments - Department configuration object
 * @returns {boolean} - True if matches department
 */
// Flexible matcher: supports array of keywords or department config
export const matchesDepartment = (grant, keywordsOrDeptKey, departments) => {
  // If no keywords or empty array provided, match everything (all departments)
  if (keywordsOrDeptKey === undefined || keywordsOrDeptKey === null) return true;
  // If array of keywords is passed, match directly
  if (Array.isArray(keywordsOrDeptKey)) {
    if (keywordsOrDeptKey.length === 0) return true;
    const searchText = `${grant.Title || ''} ${grant.Categories || ''} ${grant.Purpose || ''} ${grant.Description || ''}`.toLowerCase();
    return keywordsOrDeptKey.some(keyword => searchText.includes((keyword || '').toLowerCase()));
  }
  // If 'all' department, always match
  if (keywordsOrDeptKey === 'all') return true;
  // Otherwise, use department config
  const dept = departments?.[keywordsOrDeptKey];
  if (!dept || !Array.isArray(dept.keywords)) return false;
  const searchText = `${grant.Title || ''} ${grant.Categories || ''} ${grant.Purpose || ''} ${grant.Description || ''}`.toLowerCase();
  return (dept.keywords || []).some(keyword => searchText.includes((keyword || '').toLowerCase()));
};
