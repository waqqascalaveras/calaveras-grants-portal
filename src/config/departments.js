// Department configuration and keyword mappings

export const departments = {
  all: { name: 'All Departments', group: 'All', keywords: [] },
  
  // HHSA - Health & Human Services Agency
  'hhsa-cmcaa': { 
    name: 'CMCAA (Calaveras Mariposa Community Action Agency)', 
    group: 'HHSA',
    keywords: ['CMCAA', 'Community', 'Action', 'Community Action Agency']
  },
  'hhsa-first-5': { 
    name: 'First 5 Calaveras', 
    group: 'HHSA',
    keywords: ['First 5', 'Children', 'Early Childhood', 'Preschool', 'Child Development']
  },
  'hhsa-human-services': { 
    name: 'Human Services', 
    group: 'HHSA',
    keywords: ['Human Services', 'Community Services', 'Assistance', 'Support Services']
  },
  'hhsa-in-home': { 
    name: 'In-Home Supportive Services', 
    group: 'HHSA',
    keywords: ['In-Home Supportive', 'IHSS', 'Home Care', 'Elderly', 'Disabled', 'Care Services']
  },
  'hhsa-mental-health': { 
    name: 'Mental Health (Behavioral Health Services)', 
    group: 'HHSA',
    keywords: ['Mental Health', 'Behavioral Health', 'Mental Illness', 'Counseling', 'Therapy', 'Psychiatric']
  },
  'hhsa-public-health': { 
    name: 'Public Health', 
    group: 'HHSA',
    keywords: ['Public Health', 'Health', 'Disease Prevention', 'Epidemiology', 'Health Services', 'Communicable Disease', 'Community Health']
  },
  'hhsa-social-services': { 
    name: 'Social Services', 
    group: 'HHSA',
    keywords: ['Social Services', 'TANF', 'CALWORKS', 'Welfare', 'Assistance', 'Family', 'Children', 'Youth', 'Senior', 'Elderly']
  },
  'hhsa-substance': { 
    name: 'Substance Use Services', 
    group: 'HHSA',
    keywords: ['Substance Use', 'Substance Abuse', 'Addiction', 'Treatment', 'Recovery', 'Drug', 'Alcohol']
  },
  'hhsa-veterans': { 
    name: 'Veterans Services', 
    group: 'HHSA',
    keywords: ['Veterans', 'Military', 'Benefits', 'Services', 'VA', 'Veterans Affairs']
  },
  
  // Public Safety & Justice
  'ps-sheriff': { 
    name: 'Sheriff\'s Office', 
    group: 'Public Safety & Justice',
    keywords: ['Sheriff', 'Public Safety', 'Law Enforcement', 'Police', 'Security', 'Crime Prevention']
  },
  'ps-district-attorney': { 
    name: 'District Attorney', 
    group: 'Public Safety & Justice',
    keywords: ['District Attorney', 'DA', 'Prosecution', 'Criminal Justice', 'Law Enforcement']
  },
  'ps-probation': { 
    name: 'Probation', 
    group: 'Public Safety & Justice',
    keywords: ['Probation', 'Supervision', 'Juvenile', 'Adult Probation', 'Public Safety']
  },
  'ps-coroner': { 
    name: 'County Coroner', 
    group: 'Public Safety & Justice',
    keywords: ['Coroner', 'Death', 'Autopsy', 'Investigation']
  },
  'ps-corrections': { 
    name: 'Community Corrections Partnership', 
    group: 'Public Safety & Justice',
    keywords: ['Community Corrections', 'Probation', 'Corrections', 'Public Safety', 'Justice']
  },
  'ps-victim-services': { 
    name: 'Victim Services', 
    group: 'Public Safety & Justice',
    keywords: ['Victim', 'Crime Victim', 'Assistance', 'Restitution', 'Support Services']
  },
  
  // Infrastructure & Planning
  'infra-public-works': { 
    name: 'Public Works', 
    group: 'Infrastructure & Planning',
    keywords: ['Public Works', 'Transportation', 'Infrastructure', 'Water', 'Wastewater', 'Roads', 'Bridges', 'Construction', 'Maintenance']
  },
  'infra-planning': { 
    name: 'Planning', 
    group: 'Infrastructure & Planning',
    keywords: ['Planning', 'Development', 'Land Use', 'Zoning', 'Community Development', 'General Plan']
  },
  'infra-building': { 
    name: 'Building', 
    group: 'Infrastructure & Planning',
    keywords: ['Building', 'Construction', 'Building Permits', 'Inspection', 'Code']
  },
  'infra-on-site-water': { 
    name: 'On-Site Wastewater', 
    group: 'Infrastructure & Planning',
    keywords: ['Wastewater', 'Water', 'Septic', 'Sanitation', 'Treatment', 'On-Site']
  },
  
  // Environment & Natural Resources
  'env-environmental': { 
    name: 'Environmental Management Agency', 
    group: 'Environment & Natural Resources',
    keywords: ['Environment', 'Environmental', 'Climate', 'Sustainability', 'Conservation', 'Natural Resources', 'Waste Management']
  },
  'env-air-pollution': { 
    name: 'Air Pollution', 
    group: 'Environment & Natural Resources',
    keywords: ['Air', 'Pollution', 'Emissions', 'Atmosphere', 'Environment', 'Air Quality']
  },
  'env-integrated-waste': { 
    name: 'Integrated Waste', 
    group: 'Environment & Natural Resources',
    keywords: ['Waste', 'Recycling', 'Landfill', 'Solid Waste', 'Environment', 'Sustainability']
  },
  'env-agriculture': { 
    name: 'Agriculture', 
    group: 'Environment & Natural Resources',
    keywords: ['Agriculture', 'Farming', 'Rural', 'Food', 'Crop', 'Ranching']
  },
  
  // Administration & Operations
  'admin-administration': { 
    name: 'Administration', 
    group: 'Administration & Operations',
    keywords: ['Administration', 'Administrative', 'Management']
  },
  'admin-human-resources': { 
    name: 'Human Resources', 
    group: 'Administration & Operations',
    keywords: ['Human Resources', 'HR', 'Personnel', 'Employment', 'Staff', 'Training', 'Development']
  },
  'admin-information-technology': { 
    name: 'Information Technology', 
    group: 'Administration & Operations',
    keywords: ['Information Technology', 'IT', 'Technology', 'Data', 'Digital', 'Broadband', 'Internet', 'Information Systems', 'Modernization', 'Cybersecurity']
  },
  'admin-auditor': { 
    name: 'Auditor Controller', 
    group: 'Administration & Operations',
    keywords: ['Audit', 'Auditor', 'Controller', 'Finance', 'Accounting', 'Fiscal']
  },
  'admin-county-counsel': { 
    name: 'County Counsel', 
    group: 'Administration & Operations',
    keywords: ['Counsel', 'Legal', 'Law', 'Attorney', 'Litigation']
  },
  'admin-gis': { 
    name: 'GIS', 
    group: 'Administration & Operations',
    keywords: ['GIS', 'Geographic', 'Mapping', 'Geospatial', 'Data Management']
  },
  'admin-gis-open-data': { 
    name: 'GIS Open Data Portal', 
    group: 'Administration & Operations',
    keywords: ['Open Data', 'GIS', 'Portal', 'Public Data', 'Transparency']
  },
  
  // Community Services & Records
  'comm-library': { 
    name: 'Library', 
    group: 'Community Services & Records',
    keywords: ['Library', 'Libraries', 'Books', 'Reading', 'Education', 'Community', 'Literacy']
  },
  'comm-clerk-recorder': { 
    name: 'Clerk Recorder', 
    group: 'Community Services & Records',
    keywords: ['Clerk', 'Recorder', 'Recording', 'Elections', 'Vital Records', 'Notary']
  },
  'comm-archives': { 
    name: 'Archives', 
    group: 'Community Services & Records',
    keywords: ['Archives', 'Records', 'Historical', 'Library', 'Documentation']
  },
  'comm-elections': { 
    name: 'Elections', 
    group: 'Community Services & Records',
    keywords: ['Elections', 'Voting', 'Election Administration', 'Civic Engagement']
  },
  'comm-public-access-tv': { 
    name: 'Public Access TV', 
    group: 'Community Services & Records',
    keywords: ['Public Access', 'Television', 'Media', 'Broadcasting', 'Community']
  },
  
  // County Services
  'services-assessor': { 
    name: 'Assessor', 
    group: 'County Services',
    keywords: ['Property', 'Assessor', 'Assessment', 'Valuation', 'Tax']
  },
  'services-tax-collector': { 
    name: 'Tax Collector', 
    group: 'County Services',
    keywords: ['Tax', 'Tax Collection', 'Revenue', 'Assessment']
  },
  'services-surveyor': { 
    name: 'Surveyor', 
    group: 'County Services',
    keywords: ['Survey', 'Surveyor', 'Land Surveying', 'Boundary', 'Mapping']
  },
  'services-animal-services': { 
    name: 'Animal Services', 
    group: 'County Services',
    keywords: ['Animal', 'Animals', 'Pets', 'Wildlife', 'Control', 'Shelter']
  },
  'services-code-compliance': { 
    name: 'Code Compliance', 
    group: 'County Services',
    keywords: ['Code', 'Compliance', 'Enforcement', 'Violations']
  },
  'services-cannabis-control': { 
    name: 'Cannabis Control', 
    group: 'County Services',
    keywords: ['Cannabis', 'Marijuana', 'Licensing', 'Regulation']
  },
  
  // Governance & Oversight
  'gov-board-supervisors': { 
    name: 'Board of Supervisors', 
    group: 'Governance & Oversight',
    keywords: ['Board', 'Supervisors', 'Governance', 'Board Meetings']
  },
  'gov-grand-jury': { 
    name: 'Grand Jury', 
    group: 'Governance & Oversight',
    keywords: ['Grand Jury', 'Jury', 'Judicial', 'Oversight']
  },
  'gov-public-authority': { 
    name: 'Public Authority', 
    group: 'Governance & Oversight',
    keywords: ['Authority', 'Public Agency', 'Board']
  },
  'gov-oes': { 
    name: 'OES (Emergency Services)', 
    group: 'Governance & Oversight',
    keywords: ['OES', 'Emergency Services', 'Emergency Management', 'Disaster', 'Recovery', 'Emergency Preparedness']
  },
  
  // Community Development
  'dev-economic-development': { 
    name: 'Economic Development', 
    group: 'Community Development',
    keywords: ['Economic Development', 'Business', 'Industry', 'Commerce', 'Job Creation', 'Entrepreneurship']
  },
  'dev-airport': { 
    name: 'Airport', 
    group: 'Community Development',
    keywords: ['Airport', 'Aviation', 'Transportation']
  }
};

// Helper function to get departments grouped by category
export const getDepartmentsByGroup = () => {
  const grouped = {};
  Object.entries(departments).forEach(([key, dept]) => {
    if (dept.group === 'All') return; // Skip 'All'
    if (!grouped[dept.group]) {
      grouped[dept.group] = [];
    }
    grouped[dept.group].push({ key, ...dept });
  });
  return grouped;
};

