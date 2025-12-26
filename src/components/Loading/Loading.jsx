import React from 'react';
import { Loader } from 'lucide-react';

const Loading = () => {
  return (
    <div className="loading-container">
      <Loader className="spinner" size={48} />
      <p>Loading California grant opportunities...</p>
    </div>
  );
};

export default Loading;