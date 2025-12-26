import React from 'react';
import { Search, Filter, CheckCircle } from 'lucide-react';
import { departments } from '../../config/departments';

const FiltersSection = ({
  searchQuery,
  setSearchQuery,
  selectedDepartment,
  setSelectedDepartment,
  statusFilter,
  setStatusFilter,
  filteredGrants
}) => {
  return (
    <div className="filters-section">
      <div className="filters-container">
        {/* Search */}
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search grants by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Department Filter */}
        <div className="filter-group">
          <label>
            <Filter size={16} />
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {Object.entries(departments).map(([key, dept]) => (
              <option key={key} value={key}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label>
            <CheckCircle size={16} />
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="open">Open & Recent</option>
            <option value="forecasted">Forecasted Only</option>
            <option value="active">Active Only</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        <strong>{filteredGrants.length}</strong> eligible grants found
      </div>
    </div>
  );
};

export default FiltersSection;