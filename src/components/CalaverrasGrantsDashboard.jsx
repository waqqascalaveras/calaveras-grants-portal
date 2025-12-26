import React, { useState, useEffect, useMemo } from 'react';
import { matchesDepartment } from '../utils/eligibilityFilters';
import { departments } from '../config/departments';
import { getGrants } from '../services/grantService';
import { isEligibleForCounty, isRecentlyClosed } from '../utils/eligibilityFilters';

// Components
import Header from './Header/Header';
import FiltersSection from './FiltersSection/FiltersSection';
import GrantsList from './GrantsList/GrantsList';
import Footer from './Footer/Footer';
import Loading from './Loading/Loading';
import Error from './Error/Error';

// Styles
import './Header/Header.css';
import './FiltersSection/FiltersSection.css';
import './GrantCard/GrantCard.css';
import './GrantsList/GrantsList.css';
import './Footer/Footer.css';
import './Loading/Loading.css';
import './Error/Error.css';
import './CalaverrasGrantsDashboard.css';

const CalaverrasGrantsDashboard = () => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');
  const [lastUpdated, setLastUpdated] = useState(null);



  // Fetch and cache grant data
  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);
        const result = await getGrants();
        setGrants(result.data);
        setLastUpdated(result.timestamp);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGrants();
  }, []);

  // Filter grants for Calaveras County eligibility
  const filteredGrants = useMemo(() => {
    let filtered = grants.filter(grant => {
      // Must be eligible for counties
      if (!isEligibleForCounty(grant)) return false;

      // Status filter
      const status = grant.Status?.toLowerCase() || '';
      if (statusFilter === 'open' && status === 'closed' && !isRecentlyClosed(grant)) {
        return false;
      }
      if (statusFilter === 'forecasted' && status !== 'forecasted') {
        return false;
      }
      if (statusFilter === 'active' && status !== 'active') {
        return false;
      }

      // Department filter
      if (!matchesDepartment(grant, selectedDepartment, departments)) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchText = `${grant.Title} ${grant.Purpose} ${grant.Description} ${grant.AgencyDept}`.toLowerCase();
        if (!searchText.includes(query)) return false;
      }

      return true;
    });

    // Sort: open first, then forecasted, then recently closed (dimmed)
    return filtered.sort((a, b) => {
      const statusOrder = { active: 0, forecasted: 1, closed: 2 };
      const aStatus = a.Status?.toLowerCase() || 'active';
      const bStatus = b.Status?.toLowerCase() || 'active';

      if (statusOrder[aStatus] !== statusOrder[bStatus]) {
        return statusOrder[aStatus] - statusOrder[bStatus];
      }

      // Within same status, sort by deadline
      const aDeadline = new Date(a.ApplicationDeadline || '2099-12-31');
      const bDeadline = new Date(b.ApplicationDeadline || '2099-12-31');
      return aDeadline - bDeadline;
    });
  }, [grants, selectedDepartment, searchQuery, statusFilter]);

  // Handle retry on error
  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Error error={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header lastUpdated={lastUpdated} />
      <FiltersSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        filteredGrants={filteredGrants}
      />
      <GrantsList filteredGrants={filteredGrants} />
      <Footer />
    </div>
  );
};

export default CalaverrasGrantsDashboard;
