/**
 * Unit tests for grant eligibility filter functions
 * Tests the core logic that determines which grants are shown to County staff
 */

import { 
  isEligibleForCounty, 
  isRecentlyClosed, 
  matchesDepartment 
} from '../eligibilityFilters';

describe('isEligibleForCounty', () => {
  describe('Eligible grants', () => {
    it('should return true when ApplicantType includes "Public Agency"', () => {
      const grant = { ApplicantType: 'Public Agency; Nonprofit; Business' };
      expect(isEligibleForCounty(grant)).toBe(true);
    });

    it('should return true when ApplicantType includes "County"', () => {
      const grant = { ApplicantType: 'County; City' };
      expect(isEligibleForCounty(grant)).toBe(true);
    });

    it('should return true when ApplicantType includes "Local Government"', () => {
      const grant = { ApplicantType: 'Local Government; Regional Agency' };
      expect(isEligibleForCounty(grant)).toBe(true);
    });

    it('should return true when ApplicantType includes "Tribal Government"', () => {
      const grant = { ApplicantType: 'Tribal Government; Public Agency' };
      expect(isEligibleForCounty(grant)).toBe(true);
    });

    it('should return true when no ApplicantType is specified', () => {
      const grant = {};
      expect(isEligibleForCounty(grant)).toBe(true);
    });

    it('should return true for mixed eligible and general types', () => {
      const grant = { ApplicantType: 'Public Agency; Nonprofit; Business; Individual' };
      expect(isEligibleForCounty(grant)).toBe(true);
    });
  });

  describe('Ineligible grants', () => {
    it('should return false when ApplicantType is "Individual Only"', () => {
      const grant = { ApplicantType: 'Individual Only' };
      expect(isEligibleForCounty(grant)).toBe(false);
    });

    it('should return false when ApplicantType is "Business Only"', () => {
      const grant = { ApplicantType: 'Business Only' };
      expect(isEligibleForCounty(grant)).toBe(false);
    });

    it('should return false when ApplicantType is "Nonprofit Only"', () => {
      const grant = { ApplicantType: 'Nonprofit Only' };
      expect(isEligibleForCounty(grant)).toBe(false);
    });

    it('should handle case-insensitive matching', () => {
      const grant1 = { ApplicantType: 'INDIVIDUAL ONLY' };
      const grant2 = { ApplicantType: 'Individual only' };
      expect(isEligibleForCounty(grant1)).toBe(false);
      expect(isEligibleForCounty(grant2)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined ApplicantType', () => {
      const grant = { ApplicantType: undefined };
      expect(isEligibleForCounty(grant)).toBe(true);
    });

    it('should handle null ApplicantType', () => {
      const grant = { ApplicantType: null };
      expect(isEligibleForCounty(grant)).toBe(true);
    });

    it('should handle empty string ApplicantType', () => {
      const grant = { ApplicantType: '' };
      expect(isEligibleForCounty(grant)).toBe(true);
    });

    it('should handle ApplicantType with extra whitespace', () => {
      const grant = { ApplicantType: '  Public Agency  ; Nonprofit  ' };
      expect(isEligibleForCounty(grant)).toBe(true);
    });
  });
});

describe('isRecentlyClosed', () => {
  const today = new Date();
  const twentyDaysAgo = new Date(today.getTime() - (20 * 24 * 60 * 60 * 1000));
  const fortyDaysAgo = new Date(today.getTime() - (40 * 24 * 60 * 60 * 1000));

  describe('Recently closed grants', () => {
    it('should return true for grants closed 20 days ago', () => {
      const grant = {
        Status: 'closed',
        ApplicationDeadline: twentyDaysAgo.toISOString()
      };
      expect(isRecentlyClosed(grant)).toBe(true);
    });

    it('should return true for grants closed today', () => {
      const grant = {
        Status: 'closed',
        ApplicationDeadline: today.toISOString()
      };
      expect(isRecentlyClosed(grant)).toBe(true);
    });

    it('should handle case-insensitive status', () => {
      const grant = {
        Status: 'CLOSED',
        ApplicationDeadline: twentyDaysAgo.toISOString()
      };
      expect(isRecentlyClosed(grant)).toBe(true);
    });
  });

  describe('Not recently closed grants', () => {
    it('should return false for grants closed 40 days ago', () => {
      const grant = {
        Status: 'closed',
        ApplicationDeadline: fortyDaysAgo.toISOString()
      };
      expect(isRecentlyClosed(grant)).toBe(false);
    });

    it('should return false for open grants', () => {
      const grant = {
        Status: 'open',
        ApplicationDeadline: twentyDaysAgo.toISOString()
      };
      expect(isRecentlyClosed(grant)).toBe(false);
    });

    it('should return false for forecasted grants', () => {
      const grant = {
        Status: 'forecasted',
        ApplicationDeadline: twentyDaysAgo.toISOString()
      };
      expect(isRecentlyClosed(grant)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should return false when deadline is missing', () => {
      const grant = { Status: 'closed' };
      expect(isRecentlyClosed(grant)).toBe(false);
    });

    it('should return false when status is missing', () => {
      const grant = { ApplicationDeadline: twentyDaysAgo.toISOString() };
      expect(isRecentlyClosed(grant)).toBe(false);
    });

    it('should handle invalid date formats gracefully', () => {
      const grant = {
        Status: 'closed',
        ApplicationDeadline: 'invalid-date'
      };
      expect(isRecentlyClosed(grant)).toBe(false);
    });

    it('should accept custom days threshold', () => {
      const grant = {
        Status: 'closed',
        ApplicationDeadline: fortyDaysAgo.toISOString()
      };
      expect(isRecentlyClosed(grant, 30)).toBe(false);
      expect(isRecentlyClosed(grant, 50)).toBe(true);
    });
  });
});

describe('matchesDepartment', () => {
  const sampleGrant = {
    Title: 'Public Health Emergency Preparedness Grant',
    Categories: 'Health & Human Services; Emergency',
    Purpose: 'Improve disease surveillance and response capabilities',
    Description: 'This grant supports local health departments in building capacity...'
  };

  describe('Department matching', () => {
    it('should match when keyword is in title', () => {
      const keywords = ['Health', 'Medical'];
      expect(matchesDepartment(sampleGrant, keywords)).toBe(true);
    });

    it('should match when keyword is in categories', () => {
      const keywords = ['Emergency', 'Safety'];
      expect(matchesDepartment(sampleGrant, keywords)).toBe(true);
    });

    it('should match when keyword is in purpose', () => {
      const keywords = ['Disease', 'Surveillance'];
      expect(matchesDepartment(sampleGrant, keywords)).toBe(true);
    });

    it('should match when keyword is in description', () => {
      const keywords = ['Capacity', 'Building'];
      expect(matchesDepartment(sampleGrant, keywords)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const keywords = ['HEALTH', 'health', 'HeAlTh'];
      expect(matchesDepartment(sampleGrant, keywords)).toBe(true);
    });

    it('should match partial keywords', () => {
      const keywords = ['Emerge']; // Should match "Emergency"
      expect(matchesDepartment(sampleGrant, keywords)).toBe(true);
    });
  });

  describe('No match scenarios', () => {
    it('should not match when no keywords match', () => {
      const keywords = ['Agriculture', 'Farming'];
      expect(matchesDepartment(sampleGrant, keywords)).toBe(false);
    });

    it('should return true for empty keyword array (all departments)', () => {
      expect(matchesDepartment(sampleGrant, [])).toBe(true);
    });

    it('should return true for null keywords', () => {
      expect(matchesDepartment(sampleGrant, null)).toBe(true);
    });

    it('should return true for undefined keywords', () => {
      expect(matchesDepartment(sampleGrant, undefined)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle grants with missing fields', () => {
      const incompleteGrant = { Title: 'Test Grant' };
      const keywords = ['Test'];
      expect(matchesDepartment(incompleteGrant, keywords)).toBe(true);
    });

    it('should handle grants with null fields', () => {
      const nullFieldGrant = {
        Title: null,
        Categories: 'Health',
        Purpose: null,
        Description: null
      };
      const keywords = ['Health'];
      expect(matchesDepartment(nullFieldGrant, keywords)).toBe(true);
    });

    it('should handle multiple matching keywords', () => {
      const keywords = ['Health', 'Emergency', 'Disease'];
      expect(matchesDepartment(sampleGrant, keywords)).toBe(true);
    });

    it('should match with at least one keyword', () => {
      const keywords = ['Agriculture', 'Health', 'Construction'];
      expect(matchesDepartment(sampleGrant, keywords)).toBe(true);
    });
  });
});

// Performance test
describe('Performance', () => {
  it('should process 1000 grants quickly', () => {
    const grants = Array.from({ length: 1000 }, (_, i) => ({
      ApplicantType: i % 2 === 0 ? 'Public Agency' : 'Individual Only',
      Status: i % 3 === 0 ? 'closed' : 'open',
      ApplicationDeadline: new Date().toISOString(),
      Title: `Grant ${i}`,
      Categories: 'Health; Education',
      Purpose: 'Test purpose',
      Description: 'Test description'
    }));

    const startTime = performance.now();
    
    grants.forEach(grant => {
      isEligibleForCounty(grant);
      isRecentlyClosed(grant);
      matchesDepartment(grant, ['Health', 'Education']);
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should process 1000 grants in under 100ms
    expect(duration).toBeLessThan(100);
  });
});
