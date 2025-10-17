

import React from 'react';
import { Link } from 'react-router-dom'; 
import ProductCard from './ProductCard'; 

/**
 * ProductGallery Component displays a responsive grid of ProductCard components.
 * @param {Array<Object>} products - The array of product objects to display.
 */
const ProductGallery = ({ products = [] }) => {
    
    // Check if there are products to display
    if (products.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-xl font-semibold text-gray-600">No products found matching your criteria.</p>
                <p className="text-gray-500">Please try adjusting your filters or search terms.</p>
            </div>
        );
    }

    return (
        // Responsive grid layout for product cards
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 p-4">
            {products.map((product) => (
                // 🟢 FIX 2: Wrap the ProductCard in a Link component to enable navigation.
                <div key={product._id} className="col-span-1">
                    <Link 
                        to={`/product/${product._id}`} // Set the destination URL
                        className="group block h-full" // Ensure the Link fills the container and styling is applied
                    >
                        <ProductCard product={product} />
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default ProductGallery;