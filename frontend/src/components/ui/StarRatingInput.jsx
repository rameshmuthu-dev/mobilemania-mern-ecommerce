import React, { useState } from 'react';

/**
 * Renders an interactive star rating component for user input (1 to 5 stars).
 * Clicking on a star sets the rating value in the parent component's state.
 *
 * @param {object} props - The component props.
 * @param {number} props.rating - The current selected rating value (state from parent).
 * @param {function} props.setRating - State setter function to update the rating in the parent.
 * @param {string} [props.activeColor] - Custom color for the filled stars. Defaults to text-lime-500.
 */
const StarRatingInput = ({ rating, setRating, activeColor = 'text-lime-500' }) => {
    // State to track the rating being hovered over (for visual feedback)
    const [hoverRating, setHoverRating] = useState(0);

    // If the user is hovering, use the hover rating for display; otherwise, use the selected rating.
    const ratingToDisplay = hoverRating || rating;

    const handleStarClick = (newRating) => {
        // Ensure rating is between 1 and 5
        const finalRating = Math.min(5, Math.max(1, newRating));
        
        // Toggle feature: If the user clicks the currently selected star, reset the rating to 0.
        // This is a common pattern to allow users to "unselect" their rating.
        if (rating === finalRating) {
            setRating(0); 
        } else {
            setRating(finalRating);
        }
    };

    return (
        <div className="flex items-center text-2xl cursor-pointer">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1; // Represents 1 to 5 stars

                // Determine the visual class based on hover or selected state
                const starColorClass = starValue <= ratingToDisplay 
                    ? activeColor 
                    : 'text-gray-300 hover:text-gray-400';

                return (
                    <span 
                        key={index} 
                        className={`transition-colors duration-100 ${starColorClass}`}
                        onClick={() => handleStarClick(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        // Reset hover rating when the mouse leaves the entire star container
                        onMouseLeave={() => setHoverRating(0)} 
                        title={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                    >
                        ★
                    </span>
                );
            })}
             {/* Display the selected rating number next to the stars */}
             <span className="ml-4 text-lg font-bold text-gray-700">
                {/* Show the actual rating, or '0' if nothing is selected yet */}
                {rating > 0 ? `${rating}` : '0'} / 5
            </span>
        </div>
    );
};

export default StarRatingInput;