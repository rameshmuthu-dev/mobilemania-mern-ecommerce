// src/components/ui/Pagination.jsx

import React from 'react';
import Button from './Button'; // Reusing your Button Component

/**
 * Reusable Pagination Component.
 * @param {number} pages - Total number of pages (from Redux state 'pages').
 * @param {number} page - Current page number (from Redux state 'page').
 * @param {function} onPageChange - Handler function to change the current page.
 */
const Pagination = ({ pages, page, onPageChange }) => {
    // If there is only one page or zero pages, don't show the component
    if (!pages || pages <= 1) {
        return null;
    }

    // Function to generate the list of visible page numbers
    const getPageNumbers = () => {
        const pageNumbers = [];
        // Show all pages if total pages are 7 or less
        if (pages <= 7) {
            for (let i = 1; i <= pages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Complex logic for showing first page, current page neighborhood, and last page
            // Example: 1 ... 5 6 [7] 8 9 ... 15
            
            // 1. Always include the first page
            pageNumbers.push(1);

            // 2. Add '...' if current page is far from the start
            if (page > 3) {
                pageNumbers.push('...');
            }

            // 3. Add neighbors around the current page
            for (let i = page - 1; i <= page + 1; i++) {
                if (i > 1 && i < pages) {
                    pageNumbers.push(i);
                }
            }
            
            // 4. Add '...' if current page is far from the end
            if (page < pages - 2) {
                pageNumbers.push('..'); // Using '..' to differentiate from the first '...'
            }

            // 5. Always include the last page (only if it's not the same as the current page or its neighbor)
            if (pages !== 1) {
                const lastPage = pageNumbers[pageNumbers.length - 1];
                if (lastPage !== pages && lastPage !== (pages - 1)) {
                    pageNumbers.push(pages);
                }
            }
        }
        
        // Remove duplicates and clean up '...' markers
        return pageNumbers.filter((value, index, self) => self.indexOf(value) === index && value !== '..');
    };

    const renderedPageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center mt-10 space-x-2">
            
            {/* Previous Button */}
            <Button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                variant="secondary"
                className="!py-2 !px-4" // Override padding for smaller button
            >
                Previous
            </Button>

            {/* Page Number Buttons */}
            {renderedPageNumbers.map((p, index) => (
                <React.Fragment key={index}>
                    {p === '...' || p === '..' ? (
                        <span className="self-center px-4 py-2 text-gray-500 dark:text-gray-400">
                            ...
                        </span>
                    ) : (
                        <Button
                            onClick={() => onPageChange(p)}
                            variant={p === page ? 'primary' : 'outline'}
                            // Tweak classNames to match your primary/outline theme
                            className={`!py-2 !px-4 ${p === page ? 'shadow-md' : ''}`} // Override padding
                            disabled={p === page} // Disable current page button
                        >
                            {p}
                        </Button>
                    )}
                </React.Fragment>
            ))}

            {/* Next Button */}
            <Button
                onClick={() => onPageChange(page + 1)}
                disabled={page === pages}
                variant="secondary"
                className="!py-2 !px-4" // Override padding for smaller button
            >
                Next
            </Button>
        </div>
    );
};

export default Pagination;