// src/components/ui/Button.jsx

import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  // note: removed ...props to avoid passing isLoading to DOM
}) => {
  const baseClasses =
    "font-semibold py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center";
  
  let variantClasses = '';

  switch (variant) {
    case 'secondary':
      variantClasses =
        "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-500";
      break;
    case 'danger':
      variantClasses =
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400 dark:focus:ring-red-700";
      break;
    case 'outline':
      variantClasses =
        "border border-lime-600 text-lime-600 hover:bg-lime-50 focus:ring-lime-200 dark:border-lime-400 dark:text-lime-400 dark:hover:bg-gray-700 dark:focus:ring-lime-700/50";
      break;
    case 'gradient':
      variantClasses =
        "bg-gradient-to-r from-lime-500 to-lime-600 text-white hover:from-lime-600 hover:to-lime-700 focus:ring-lime-400 dark:focus:ring-lime-700";
      break;
    case 'primary':
    default:
      variantClasses =
        "bg-lime-500 text-white hover:bg-lime-600 focus:ring-lime-400 dark:bg-lime-600 dark:hover:bg-lime-700 dark:focus:ring-lime-700";
      break;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {isLoading ? (
        <FaSpinner className="animate-spin mr-2" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
