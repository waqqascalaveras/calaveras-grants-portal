import React from 'react';
import { Building2, Clock } from 'lucide-react';

const Header = ({ lastUpdated }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Building2 size={32} />
          <div>
            <h1>Calaveras County Grants Portal</h1>
            <p className="subtitle">Find funding opportunities for your department</p>
          </div>
        </div>
        <div className="cache-info">
          {lastUpdated && (
            <span className="cache-time">
              <Clock size={14} />
              Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;