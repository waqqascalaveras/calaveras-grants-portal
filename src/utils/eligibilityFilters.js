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
  
  // If has explicit eligible type (Public Agency, County, etc.), allow it even if nonprofit is also listed
  // This handles mixed types like "Public Agency; Nonprofit; Business"
  if (hasEligibleType) return true;
  
  // If has "only" restriction, exclude it
  if (hasRestrictedType) return false;
  
  // If ONLY contains "nonprofit" (no other eligible types), exclude it for county
  if (applicantType.includes('nonprofit') && !hasEligibleType) return false;
  
  // Allow other general types
  return applicantType.length > 0;
};

/**
 * Check if a grant is eligible for Community-Based Organizations (CBOs)
 * @param {Object} grant - Grant record
 * @returns {boolean} - True if CBO eligible
 */
export const isEligibleForCBO = (grant) => {
  const applicantType = grant.ApplicantType?.toLowerCase() || '';
  // If ApplicantType is missing/empty, treat as potentially eligible
  if (!grant.ApplicantType || !applicantType.trim()) return true;

  const eligibleTypes = [
    'nonprofit',
    '501c3',
    'community organization',
    'community-based',
    'ngo',
    'faith-based'
  ];
  const restrictedTypes = [
    'individual only',
    'business only',
    'government only',
    'public agency only'
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
 * Match grant to CBO organization type
 * All CBO subtypes see ALL nonprofit-eligible grants
 * Subtypes are for user identification only, not filtering
 * @param {Object} _grant - Grant record
 * @param {string} _organizationType - Organization type key (nonprofit, faith_based, etc.)
 * @returns {boolean} - True if grant matches organization type (always true for CBOs)
 */
export const matchesCBOType = (_grant, _organizationType) => {
  // All CBO subtypes see all CBO-eligible grants
  // The dropdown is purely for user identification
  return true;
};

/**
 * Calculate relevance score for a grant based on organization type keywords
 * Used for prioritizing/highlighting grants, not filtering
 * @param {Object} grant - Grant record
 * @param {string} organizationType - Organization type key
 * @returns {number} - Relevance score (0-10)
 */
export const calculateCBORelevance = (grant, organizationType) => {
  if (!organizationType || organizationType === 'all' || organizationType === 'nonprofit') {
    return 5; // Neutral/baseline
  }

  const searchableText = `${grant.Title || ''} ${grant.Categories || ''} ${grant.Purpose || ''} ${grant.Description || ''}`.toLowerCase();
  const applicantType = (grant.ApplicantType || '').toLowerCase();
  
  const typeKeywords = {
    faith_based: {
      primary: ['faith', 'religious', 'church', 'ministry', 'congregation', 'spiritual'],
      secondary: ['mosque', 'synagogue', 'temple', 'parish', 'chapel']
    },
    community_group: {
      primary: ['community', 'neighborhood', 'grassroots', 'civic'],
      secondary: ['resident', 'local organization', 'community-based']
    },
    education: {
      primary: ['education', 'school', 'student', 'learning', 'academic'],
      secondary: ['university', 'college', 'teacher', 'scholarship', 'literacy']
    },
    tribal: {
      primary: ['tribal', 'indigenous', 'native american', 'tribe'],
      secondary: ['alaska native', 'native hawaiian', 'american indian']
    }
  };

  const keywords = typeKeywords[organizationType];
  if (!keywords) return 5;

  let score = 5; // Start at baseline

  // Check ApplicantType for exact matches (highest priority)
  const primaryInApplicant = keywords.primary.some(kw => applicantType.includes(kw));
  const secondaryInApplicant = keywords.secondary.some(kw => applicantType.includes(kw));
  
  if (primaryInApplicant) score += 3;
  else if (secondaryInApplicant) score += 2;

  // Check title (high priority)
  const titleText = (grant.Title || grant.GrantTitle || '').toLowerCase();
  const primaryInTitle = keywords.primary.some(kw => titleText.includes(kw));
  const secondaryInTitle = keywords.secondary.some(kw => titleText.includes(kw));
  
  if (primaryInTitle) score += 2;
  else if (secondaryInTitle) score += 1;

  // Check categories/description (medium priority)
  const primaryInContent = keywords.primary.some(kw => searchableText.includes(kw));
  const secondaryInContent = keywords.secondary.some(kw => searchableText.includes(kw));
  
  if (primaryInContent && !primaryInTitle) score += 1;
  if (secondaryInContent && !secondaryInTitle) score += 0.5;

  return Math.min(10, score); // Cap at 10
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
