// src/components/ui/Input.jsx

import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, Icon, className = '', ...props }, ref) => {
  const baseInputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400";
  // Dynamically add left padding if an icon is provided
  const iconPaddingClass = Icon ? 'pl-10' : 'pl-4'; 

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          // Icon positioning
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
        <input
          ref={ref}
          className={`${baseInputClasses} ${iconPaddingClass} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
});

Input.displayName = 'Input';
export default Input;