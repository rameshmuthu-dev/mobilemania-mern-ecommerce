// StarRating.jsx

import React from 'react';

// Optional: You can choose to import a specific star icon for better visuals if using an icon library.
// For simplicity, we will stick to the Unicode star character '★' as in your original code.

/**
 * Renders a visual star rating display.
 * It's designed to show the final rating value (e.g., product average or individual review score).
 * * @param {object} props - The component props.
 * @param {number} props.value - The numerical rating value (e.g., 4.2).
 * @param {string} [props.color] - Custom color for the filled stars. Defaults to yellow-500.
 */
const StarRating = ({ value, color = 'text-yellow-500' }) => {
    // 1. Ensure the value is a number and clamp it between 0 and 5
    const numValue = Math.min(5, Math.max(0, Number(value))); 

    return (
        <div className="flex text-sm">
            {[...Array(5)].map((_, index) => {
                const starIndex = index + 1;

                // 2. Logic to determine star color (filled vs. empty)
                let starColorClass;
                
                if (starIndex <= numValue) {
                    // Full Star: If the star index is less than or equal to the numerical value, it's fully filled.
                    starColorClass = color;
                } else {
                    // Empty Star: Otherwise, it's greyed out.
                    starColorClass = 'text-gray-300';
                }

                // NOTE: This simple logic doesn't handle half stars visually (e.g., a half-filled icon). 
                // For half-star visuals, you would typically use a Font Awesome or React Icon component 
                // like FaStarHalfAlt and more complex rendering logic.

                return (
                    <span 
                        key={index} 
                        className={starColorClass}
                        // Optional: Add a title for accessibility
                        title={`Rating: ${numValue} out of 5`}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
};

export default StarRating;