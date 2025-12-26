// Utility functions for eligibility filtering

/**
 * Check if a grant is eligible for county government application
 * @param {Object} grant - Grant record from CA grants portal
 * @returns {boolean} - True if county eligible
 */
export const isEligibleForCounty = (grant) => {
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

/**
 * Check if grant is recently closed (within 30 days)
 * @param {Object} grant - Grant record
 * @returns {boolean} - True if recently closed
 */
export const isRecentlyClosed = (grant) => {
  if (grant.Status?.toLowerCase() !== 'closed') return false;
  
  const deadline = grant.ApplicationDeadline;
  if (!deadline) return false;
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return deadlineDate >= thirtyDaysAgo;
};

/**
 * Match grant to department based on keywords
 * @param {Object} grant - Grant record
 * @param {string} deptKey - Department key
 * @param {Object} departments - Department configuration object
 * @returns {boolean} - True if matches department
 */
export const matchesDepartment = (grant, deptKey, departments) => {
  if (deptKey === 'all') return true;
  
  const dept = departments[deptKey];
  const searchText = `${grant.Title} ${grant.Categories} ${grant.Purpose} ${grant.Description}`.toLowerCase();
  
  return dept.keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
};
