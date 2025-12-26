# Calaveras County Grants Portal

A professional web application that helps Calaveras County staff discover and track relevant funding opportunities from California's state grants portal.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/react-18.0%2B-brightgreen)
![License](https://img.shields.io/badge/license-County%20Internal-lightgrey)

## 🎯 Features

- **Smart Filtering**: Automatically filters grants to show only those eligible for county agencies
- **Department Matching**: Intelligent keyword matching across 10 county departments
- **Automatic Caching**: 12-hour cache system for fast loading and reduced API calls
- **Status Management**: Displays open, forecasted, and recently closed grants with clear visual indicators
- **Real-time Search**: Search across titles, descriptions, and categories
- **Professional UI**: Clean, modern interface optimized for desktop workflows

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
REACT_APP_API_BASE_URL=https://data.ca.gov/api/3/action
REACT_APP_RESOURCE_ID=111c8c88-21f6-453c-ae2c-b4785a0624f5
REACT_APP_CACHE_DURATION=43200000
REACT_APP_COUNTY_NAME=Calaveras County
```

## 🏗️ Project Structure

```
calaveras-grants-portal/
├── public/                    # Static files
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/           # React components
│   │   ├── CalaverrasGrantsDashboard.jsx
│   │   ├── GrantCard.jsx
│   │   ├── FilterSection.jsx
│   │   └── Header.jsx
│   ├── services/            # API and data services
│   │   ├── grantService.js
│   │   └── cacheService.js
│   ├── utils/               # Utility functions
│   │   ├── formatters.js
│   │   └── eligibilityFilters.js
│   ├── config/              # Configuration files
│   │   └── departments.js
│   ├── App.js
│   └── index.js
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

See **QUICK_START_VSCODE.md** for detailed deployment instructions.

## 📖 Documentation

- **[QUICK_START_VSCODE.md](./QUICK_START_VSCODE.md)** - Get started in 10 minutes!
- **[IMPLEMENTATION_GUIDE_VSCODE.md](./IMPLEMENTATION_GUIDE_VSCODE.md)** - Complete technical guide
- **[VSCODE_SETUP.md](./VSCODE_SETUP.md)** - VS Code configuration
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-launch checklist
- **[API Documentation](https://data.ca.gov/)** - California Grants Portal API

## 🔧 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run deploy`
Deploys the built app to GitHub Pages (one command!)

### `npm run lint`
Runs ESLint to check code quality

### `npm run format`
Formats code using Prettier

## 🏢 Department Categories

The system intelligently matches grants to these departments:

- **Public Health** - Health services, disease prevention, wellness programs
- **Social Services** - Human services, housing, family support
- **Public Works** - Infrastructure, transportation, utilities
- **Planning & Building** - Land use, zoning, community development
- **Sheriff / Emergency Services** - Public safety, disaster preparedness
- **Environmental Health** - Sustainability, conservation, waste management
- **Parks & Recreation** - Community programs, trails, facilities
- **Education & Workforce** - Training, employment, skills development
- **Agriculture** - Farming, rural development, food systems
- **IT & Data Modernization** - Technology, broadband, data systems

## 🔍 How It Works

1. **Data Fetching**: Retrieves grant data from California's open data portal
2. **Caching**: Stores data locally for 12 hours to improve performance
3. **Filtering**: Applies eligibility rules to show only county-eligible grants
4. **Matching**: Uses keyword analysis to match grants to departments
5. **Display**: Presents grants in a clean, searchable interface

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

### Status Categories

- **Open** ✓ - Currently accepting applications
- **Forecasted** ⚠️ - Announced but not yet open
- **Recently Closed** 🕒 - Closed within last 30 days (shown dimmed)

## 🔒 Security

- No sensitive data stored in browser
- All API calls use HTTPS
- Regular dependency security audits
- Input sanitization on all user inputs

## 📊 Performance

Target metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

## 🐛 Troubleshooting

### Cache Issues
If data seems stale:
```javascript
// Clear cache manually in browser console
localStorage.removeItem('calaverrasGrantsCache');
localStorage.removeItem('calaverrasGrantsCacheTime');
```

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
4. Await review from project lead

## 📝 Change Log

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## 👥 Team

- **Project Lead**: Waqqas Hanafi

## 📞 Support

For technical issues or questions:
- **Email**: [WHanafi@calaverascounty.gov]
- **Hours**: Monday-Friday, 8:00 AM - 5:00 PM PST

## 📄 License

Copyright © 2025 Calaveras County, California
Internal use only - Not for public redistribution

## 🙏 Acknowledgments

- California State Grants Portal team for open data access
- Calaveras County IT Department for infrastructure support
- County department heads for feedback and requirements

---

**Built with ❤️ for Calaveras County**

*Last Updated: January 2025*
