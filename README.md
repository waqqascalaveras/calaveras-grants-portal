# Calaveras County Grants Portal

A professional web application that helps Calaveras County staff discover and track relevant funding opportunities from California State Grants Portal and Federal Grants.gov.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/react-18.0%2B-brightgreen)
![License](https://img.shields.io/badge/license-County%20Internal-lightgrey)

## 🎯 Features

### Data Integration
- **Dual-Source Aggregation**: Combines California State Grants Portal and Federal Grants.gov opportunities
- **Smart Filtering**: Automatically filters grants to show only those eligible for county agencies
- **Source Identification**: Clear badges distinguish between state (CA) and federal grants

### Professional Interface
- **Table-Based Layout**: Dense, scannable data table with sticky headers
- **Interactive Timeline**: Visual deadline timeline with hover tooltips
- **Split-Screen Detail View**: Click any grant to open side-by-side detail panel
- **Enterprise Styling**: Professional color scheme with sharp corners (navy, maroon, grays)

### Intelligent Features
- **Department Matching**: Keyword matching across 10 county departments
- **Automatic Caching**: 12-hour cache system for both data sources
- **Status Management**: Displays open, forecasted, and recently closed grants
- **Real-time Search**: Search across titles, descriptions, and categories
- **Comprehensive Error Reporting**: Detailed debugging and error messages

## 📋 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher (or yarn)
- Modern web browser

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd calaveras-grants-portal

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
# California State Grants API
REACT_APP_API_BASE_URL=https://data.ca.gov/api/3/action
REACT_APP_RESOURCE_ID=111c8c88-21f6-453c-ae2c-b4785a0624f5

# Cache settings
REACT_APP_CACHE_DURATION=43200000

# County configuration
REACT_APP_COUNTY_NAME=Calaveras County
```

**Note**: Grants.gov API integration uses hardcoded public endpoints and does not require API keys.

## 🏗️ Project Structure

```
grant-finder/
├── public/                    # Static files
│   ├── index.html
│   ├── manifest.json
│   └── federal-grants-cache.json
├── src/
│   ├── components/           # React components (organized by feature)
│   │   ├── GrantsDashboard/
│   │   │   ├── GrantsDashboard.jsx  # Main dashboard with table/timeline
│   │   │   └── GrantsDashboard.css
│   │   ├── DetailedGrantCard/
│   │   │   ├── DetailedGrantCard.jsx
│   │   │   └── DetailedGrantCard.css
│   │   ├── DepartmentSelector/
│   │   ├── UserTypeSelector/
│   │   ├── StatisticsBar/
│   │   ├── GrantScatterPlot/
│   │   ├── GrantCard/
│   │   ├── GrantsList/
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Loading/
│   │   ├── Error/
│   │   ├── FiltersSection/
│   │   ├── SmartTooltip/
│   │   └── StatCard/
│   ├── services/            # API and data services
│   │   ├── grantService.js          # CA State Grants API
│   │   ├── grantsGovService.js      # Federal Grants.gov API
│   │   └── unifiedGrantService.js   # Combined data service
│   ├── utils/               # Utility functions
│   │   ├── formatters.js
│   │   └── eligibilityFilters.js
│   ├── config/              # Configuration files
│   │   ├── departments.js
│   │   └── colors.js
│   ├── App.js
│   └── index.js
├── scripts/                 # Build and validation scripts
│   ├── build_validator.py
│   ├── check_workflows.py
│   └── cleanup-project.ps1
├── .env                     # Environment variables (not in git)
├── .env.example            # Example environment file
├── package.json
└── README.md
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 🚀 Deployment

### Quick Deploy to GitHub Pages

```bash
# One command deployment!
npm run deploy
```

Your site will be live at:  
`https://[your-org].github.io/calaveras-grants-portal/`

### Automated Deployment

Every push to `main` branch automatically deploys via GitHub Actions:

1. Set up `.github/workflows/deploy.yml` (provided)
2. Enable GitHub Pages in repo Settings → Pages
3. Push changes → Auto-deploys! ✨
- **[IMPLEMENTATION_GUIDE_UIUX.md](./ux/IMPLEMENTATION_GUIDE_UIUX.md)** - UI/UX design guide
- **[UIUX_DESIGN_GUIDE.md](./ux/UIUX_DESIGN_GUIDE.md)** - Design system documentation
- **[API Documentation - CA](https://data.ca.gov/)** - California Grants Portal API
- **[API Documentation - Federal](https://www.grants.gov/web/grants/support/web-services-api.html)** - Grants.gov

- **[QUICK_START_VSCODE.md](./QUICK_START_VSCODE.md)** - Get started in 10 minutes!
- **[IMPLEMENTATION_GUIDE_VSCODE.md](./IMPLEMENTATION_GUIDE_VSCODE.md)** - Complete technical guide
- **[VSCODE_SETUP.md](./VSCODE_SETUP.md)** - VS Code configuration
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-launch checklist
- **[API Documentation](https://data.ca.gov/)** - California Grants Portal API

## 🔧 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode. Tests are located in `tests/unit/`.

### `npm run test:coverage`
Runs all tests and generates a coverage report.

### `npm run test:ci`
Runs tests in CI mode with coverage (non-interactive).

### `npm run build`
Builds the app for production to the `build` folder

### `npm run deploy`
Deploys the built app to GitHub Pages (one command!)

### `npm run lint`
Runs ESLint to check code quality

### `npm run format`
Formats code using Prettier

## 🧪 Testing

Tests are organized in the `tests/` directory:

- **Unit Tests** (`tests/unit/`): Component and utility function tests
- **Integration Tests** (`tests/integration/`): Build and deployment verification
- **Python Tests** (`tests/python/`): API connectivity and data feed validation

See [tests/README.md](tests/README.md) for detailed testing documentation.

## 🔄 Data Sources

### California State Grants Portal
- **API**: `https://data.ca.gov/api/3/action/datastore_search`
- **Resource ID**: `111c8c88-21f6-453c-ae2c-b4785a0624f5`
- **Cache Duration**: 12 hours
- **Filtering**: Automatic county eligibility check

### Federal Grants.gov
- **Search API**: `https://api.grants.gov/v1/api/search2`
- **Detail API**: `https://api.grants.gov/v1/api/fetchOpportunity`
- **Cache Duration**: 12 hours
- **Filtering**: Pre-filtered for county governments (eligibility code: `01`)
- **Status Filter**: Only `forecasted|posted` opportunities


## 🏢 Department Categories

The system intelligently matches grants to these departments:

- **Public Health** - Health services, disease prevention, wellness programs
- **Social Services** - Human services, housing, family support
- **Public Works** - Infrastructure, transportation, utilities
- **Planning & Building** - Land use, zoning, community development
### Data Pipeline
1. **Parallel Fetching**: Simultaneously retrieves data from CA State Portal and Grants.gov
2. **Normalization**: Converts Grants.gov format to match CA portal schema
3. **Caching**: Stores normalized data locally for 12 hours
4. **Aggregation**: Combines both sources into unified dataset
5. **Filtering**: Applies eligibility rules and department matching
6. **Display**: Presents in table format with source badges

### User Interface
- **Table View**: Dense, scannable table shows all grants at once
- **Timeline Visualization**: Interactive timeline with grant deadlines as dots
- **Split-Screen Details**: Click any grant row to open side-by-side detail panel
- **Sticky Filters**: Search, department, and status filters remain accessible while scrolling
- **Source Badges**: Each grant clearly labeled as "Federal" or "CA"
- **IT & Data Modernization** - Technology, broadband, data systems

## 🔍 How It Works

1. **Data Fetching**: Retrieves grant data from California's open data portal
2. **Caching**: Stores data locally for 12 hours to improve performance
3. **Filtering**: Applies eligibility rules to show only county-eligible grants
4. **Matchi- Currently accepting applications
- **Forecasted** - Announced but not yet open
- **Closed** - Past deadline (limited display)

## 🎨 Design System

### Color Palette (Professional/Enterprise)
- **Primary Navy**: `#0d1b2a` - Headers, primary elements
- **Accent Blue**: `#1b4965` - Interactive elements, links
- **Maroon**: `#8b1538` - Highlights, federal grant badges
- **Grays**: `#6c757d`, `#495057`, `#212529` - Text, borders
- **Backgrounds**: `#f5f5f5`, `#ffffff` - Base colors

### Typography
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Sharp Corners**: No rounded borders (professional, government-appropriate)
- **Dense Layout**: Maximizes information density for desktop use
### Eligibility Criteria

Grants are shown if they accept:
- Public agencies
- County governments
- Local governments
- Tribal governments

Grants are hidden if restricted to:
- Individuals only
- Businesses only
- Nonprofits only

### Status Categori, clear cache in browser console:
```javascript
// Clear CA State cache
localStorage.removeItem('calaverrasGrantsCache');
localStorage.removeItem('calaverrasGrantsCacheTime');

// Clear Federal cache
localStorage.removeItem('grantsGovCache');
localStorage.removeItem('grantsGovCacheTime');
```

### No Grants Displayed
1. Open browser DevTools (F12) and check Console tab
2. Look for logs showing:
   - `[CA Grants] Loaded X grants`
   - `[Federal Grants] Fetched X grants`
   - `[Grants Portal] Filtered X grants from X total`
3. If filters show count > 0, check filter criteria
4. If error messages appear, see error details in the UI

### API Connection Issues
- **CA State Portal**: Verify connection to `data.ca.gov`
- **Grants.gov**: Check if `api.grants.gov` is accessible
- Review browser console for specific error messages
- Note: If one source fails, the other should still work

### Build Issues
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build -- --no-
## 🐛 Troubleshooting

### Cache Issues
If data seems stale:
```javascript
// Clear cache manually in browser console
localStorage.removeItem('calaverrasGrantsCache');
localStorage.removeItem('calaverrasGrantsCacheTime');
### Version 1.0.0 (January 2026)
- ✨ **Major redesign**: Professional table-based interface
- 🎯 **Timeline visualization**: Interactive deadline timeline with tooltips
- 🔄 **Dual-source integration**: Combined CA State + Federal Grants.gov data
- 🎨 **Enterprise styling**: Professional color scheme (navy, maroon, grays)
- 📊 **Split-screen detail view**: Click grants to see side-by-side details
- 🐛 **Enhanced error reporting**: Comprehensive debugging and error messages
- ⚡ **Performance improvements**: Parallel data fetching, optimized filtering
- 🔧 **Better data normalization**: Unified schema for both data sources

See [CHANGELOG.md](./CHANGELOG.md) for complete

### API Connection Issues
- Verify internet connection
- Check California grants portal status
- Review browser console for errors

### Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear React cache
rm -rf .cache
```

## 🤝 Contributing

This is an internal County project. For changes or enhancements:

1. Create feature branch from `main`
2. Make changes and test thoroughly
3. Submit pull request with description
4.Federal Grants.gov for public API access
- Calaveras County IT Department for infrastructure support
- County department heads for feedback and requirements

---

**Built for Calaveras County**

*Last Updated: January 2026
- **Project Lead**: Waqqas Hanafi

## 📞 Support

For technical issues or questions:
- **Email**: [WHanafi@calaverascounty.gov]
- **Hours**: Monday-Friday, 8:00 AM - 5:00 PM PST

## 📄 License

Copyright © 2025 Calaveras County, California
Use or redistribution requires written permission from Calaveras County Health and Human Services Agency.

## 🙏 Acknowledgments

- California State Grants Portal team for open data access
- Calaveras County IT Department for infrastructure support
- County department heads for feedback and requirements

---

**Built with ❤️ for Calaveras County**

*Last Updated: December 2025*
