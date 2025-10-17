// src/ui/Container.jsx

import React from 'react';

const Container = ({ children, className = '' }) => {
  return (
    <div className={`mx-auto max-w-7xl px-2 sm:px-6 lg:px-4 ${className}`}>
      {children}
    </div>
  );
};

export default Container;