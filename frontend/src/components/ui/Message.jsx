// src/components/ui/Message.jsx

import React from 'react';
import { FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

/**
 * Reusable component to display informational, warning, or error messages.
 * @param {string} variant - 'info' (blue), 'warning' (yellow), 'danger' (red), 'success' (green)
 * @param {string} children - The message content
 */
const Message = ({ variant = 'info', children }) => {
  const baseClasses = "p-4 rounded-lg flex items-center shadow-md";
  let classes = '';
  let Icon = FaInfoCircle;

  switch (variant) {
    case 'danger':
      classes = "bg-red-100 text-red-800 border-l-4 border-red-500";
      Icon = FaExclamationTriangle;
      break;
    case 'warning':
      classes = "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500";
      Icon = FaExclamationTriangle;
      break;
    case 'success':
      classes = "bg-green-100 text-green-800 border-l-4 border-green-500";
      Icon = FaCheckCircle;
      break;
    case 'info':
    default:
      classes = "bg-blue-100 text-blue-800 border-l-4 border-blue-500";
      Icon = FaInfoCircle;
      break;
  }

  return (
    <div className={`${baseClasses} ${classes}`} role="alert">
      <Icon className="mr-3 flex-shrink-0" size={20} />
      <p>{children}</p>
    </div>
  );
};

export default Message;