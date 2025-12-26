import React from 'react';
import { AlertCircle } from 'lucide-react';

const Error = ({ error, onRetry }) => {
  return (
    <div className="error-container">
      <AlertCircle size={48} />
      <h2>Error Loading Data</h2>
      <p>{error}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
};

export default Error;