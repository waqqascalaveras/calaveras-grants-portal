// Department configuration and keyword mappings

export const departments = {
  all: { name: 'All Departments', keywords: [] },
  'administration': { 
    name: 'Administration', 
    keywords: ['Administration', 'Administrative', 'Management']
  },
  'airport': { 
    name: 'Airport', 
    keywords: ['Airport', 'Aviation', 'Transportation']
  },
  'agriculture': { 
    name: 'Agriculture', 
    keywords: ['Agriculture', 'Farming', 'Rural', 'Food', 'Crop']
  },
  'air-pollution': { 
    name: 'Air Pollution', 
    keywords: ['Air', 'Pollution', 'Emissions', 'Atmosphere', 'Environment']
  },
  'animal-services': { 
    name: 'Animal Services', 
    keywords: ['Animal', 'Animals', 'Pets', 'Wildlife', 'Control']
  },
  'archives': { 
    name: 'Archives', 
    keywords: ['Archives', 'Records', 'Historical', 'Library', 'Documentation']
  },
  'assessor': { 
    name: 'Assessor', 
    keywords: ['Property', 'Assessor', 'Assessment', 'Valuation']
  },
  'auditor-controller': { 
    name: 'Auditor Controller', 
    keywords: ['Audit', 'Auditor', 'Controller', 'Finance', 'Accounting']
  },
  'behavioral-health': { 
    name: 'Behavioral Health Services', 
    keywords: ['Behavioral Health', 'Mental Health', 'Mental Illness', 'Substance Abuse', 'Addiction', 'Counseling', 'Therapy']
  },
  'board-supervisors': { 
    name: 'Board of Supervisors', 
    keywords: ['Board', 'Supervisors', 'Governance', 'Board Meetings']
  },
  'building': { 
    name: 'Building', 
    keywords: ['Building', 'Construction', 'Building Permits', 'Inspection', 'Code']
  },
  'cannabis-control': { 
    name: 'Cannabis Control', 
    keywords: ['Cannabis', 'Marijuana', 'Licensing', 'Regulation']
  },
  'clerk-recorder': { 
    name: 'Clerk Recorder', 
    keywords: ['Clerk', 'Recorder', 'Recording', 'Elections', 'Vital Records', 'Notary']
  },
  'cmcaa': { 
    name: 'CMCAA', 
    keywords: ['CMCAA', 'Community', 'Action']
  },
  'code-compliance': { 
    name: 'Code Compliance', 
    keywords: ['Code', 'Compliance', 'Enforcement', 'Violations']
  },
  'community-corrections': { 
    name: 'Community Corrections Partnership', 
    keywords: ['Community Corrections', 'Probation', 'Corrections', 'Public Safety']
  },
  'coroner': { 
    name: 'County Coroner', 
    keywords: ['Coroner', 'Death', 'Autopsy', 'Investigation']
  },
  'counsel': { 
    name: 'County Counsel', 
    keywords: ['Counsel', 'Legal', 'Law', 'Attorney', 'Litigation']
  },
  'district-attorney': { 
    name: 'District Attorney', 
    keywords: ['District Attorney', 'DA', 'Prosecution', 'Criminal Justice', 'Law Enforcement']
  },
  'economic-development': { 
    name: 'Economic Development', 
    keywords: ['Economic Development', 'Business', 'Industry', 'Commerce', 'Job Creation', 'Entrepreneurship']
  },
  'elections': { 
    name: 'Elections', 
    keywords: ['Elections', 'Voting', 'Election Administration', 'Civic Engagement']
  },
  'environmental-management': { 
    name: 'Environmental Management Agency', 
    keywords: ['Environment', 'Environmental', 'Climate', 'Sustainability', 'Conservation', 'Natural Resources', 'Waste Management']
  },
  'first-5': { 
    name: 'First 5 Calaveras', 
    keywords: ['First 5', 'Children', 'Early Childhood', 'Preschool', 'Child Development']
  },
  'gis': { 
    name: 'GIS', 
    keywords: ['GIS', 'Geographic', 'Mapping', 'Geospatial', 'Data Management']
  },
  'gis-open-data': { 
    name: 'GIS Open Data Portal', 
    keywords: ['Open Data', 'GIS', 'Portal', 'Public Data', 'Transparency']
  },
  'grand-jury': { 
    name: 'Grand Jury', 
    keywords: ['Grand Jury', 'Jury', 'Judicial', 'Oversight']
  },
  'health-human-services': { 
    name: 'Health and Human Services', 
    keywords: ['Health', 'Human Services', 'Medical', 'Healthcare', 'Disease', 'Prevention', 'Wellness', 'Social Services', 'Community Health']
  },
  'human-resources': { 
    name: 'Human Resources', 
    keywords: ['Human Resources', 'HR', 'Personnel', 'Employment', 'Staff', 'Training', 'Development']
  },
  'information-technology': { 
    name: 'Information Technology', 
    keywords: ['Technology', 'IT', 'Data', 'Digital', 'Broadband', 'Internet', 'Information Systems', 'Modernization', 'Cybersecurity']
  },
  'integrated-waste': { 
    name: 'Integrated Waste', 
    keywords: ['Waste', 'Recycling', 'Landfill', 'Solid Waste', 'Environment', 'Sustainability']
  },
  'library': { 
    name: 'Library', 
    keywords: ['Library', 'Libraries', 'Books', 'Reading', 'Education', 'Community', 'Literacy']
  },
  'oes': { 
    name: 'OES', 
    keywords: ['OES', 'Emergency Services', 'Emergency Management', 'Disaster', 'Recovery']
  },
  'on-site-wastewater': { 
    name: 'On-Site Wastewater', 
    keywords: ['Wastewater', 'Water', 'Septic', 'Sanitation', 'Treatment']
  },
  'planning': { 
    name: 'Planning', 
    keywords: ['Planning', 'Development', 'Land Use', 'Zoning', 'Community Development', 'General Plan']
  },
  'probation': { 
    name: 'Probation', 
    keywords: ['Probation', 'Supervision', 'Juvenile', 'Adult Probation', 'Public Safety']
  },
  'public-access-tv': { 
    name: 'Public Access TV', 
    keywords: ['Public Access', 'Television', 'Media', 'Broadcasting', 'Community']
  },
  'public-authority': { 
    name: 'Public Authority', 
    keywords: ['Authority', 'Public Agency', 'Board']
  },
  'public-health': { 
    name: 'Public Health', 
    keywords: ['Public Health', 'Health', 'Disease Prevention', 'Epidemiology', 'Health Services', 'Communicable Disease']
  },
  'public-works': { 
    name: 'Public Works', 
    keywords: ['Public Works', 'Transportation', 'Infrastructure', 'Water', 'Wastewater', 'Roads', 'Bridges', 'Construction', 'Maintenance']
  },
  'sheriff': { 
    name: 'Sheriff\'s Office', 
    keywords: ['Sheriff', 'Public Safety', 'Law Enforcement', 'Police', 'Security', 'Crime Prevention']
  },
  'social-services': { 
    name: 'Social Services', 
    keywords: ['Social Services', 'TANF', 'CALWORKS', 'Welfare', 'Assistance', 'Family', 'Children', 'Youth', 'Senior', 'Elderly']
  },
  'surveyor': { 
    name: 'Surveyor', 
    keywords: ['Survey', 'Surveyor', 'Land Surveying', 'Boundary', 'Mapping']
  },
  'tax-collector': { 
    name: 'Tax Collector', 
    keywords: ['Tax', 'Tax Collection', 'Revenue', 'Assessment']
  },
  'veterans-services': { 
    name: 'Veterans Services', 
    keywords: ['Veterans', 'Military', 'Benefits', 'Services', 'VA', 'Veterans Affairs']
  },
  'victim-services': { 
    name: 'Victim Services', 
    keywords: ['Victim', 'Crime Victim', 'Assistance', 'Restitution', 'Support Services']
  }
};

