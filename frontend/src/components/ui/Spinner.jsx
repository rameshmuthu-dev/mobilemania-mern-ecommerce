// src/components/ui/Spinner.jsx

import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-full my-8">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;