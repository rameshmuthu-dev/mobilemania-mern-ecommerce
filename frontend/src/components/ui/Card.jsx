// src/components/ui/Card.jsx

import React from 'react';

const Card = ({ children, className = '' }) => {
  const baseClasses = "bg-white p-6 rounded-xl shadow-lg border border-gray-100";
  
  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;