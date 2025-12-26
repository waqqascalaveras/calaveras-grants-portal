import React from 'react';
import { AlertCircle } from 'lucide-react';
import GrantCard from '../GrantCard/GrantCard';

const GrantsList = ({ filteredGrants }) => {
  return (
    <div className="grants-container">
      {filteredGrants.length === 0 ? (
        <div className="no-results">
          <AlertCircle size={48} />
          <h3>No Grants Found</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        filteredGrants.map((grant) => (
          <GrantCard key={grant.PortalID} grant={grant} />
        ))
      )}
    </div>
  );
};

export default GrantsList;