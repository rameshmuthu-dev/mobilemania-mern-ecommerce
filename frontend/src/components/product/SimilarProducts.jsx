// File: SimilarProducts.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSimilarProducts, clearSimilarProducts } from '../../redux/slices/productSlice';
import { Link } from 'react-router-dom';
import Spinner from '../ui/Spinner'
import ProductCard from '../product/ProductCard'

/**
 * Component to display recommended products of the same category.
 * It fetches the data using the current product's ID.
 */
const SimilarProducts = ({ currentProductId }) => {
    const dispatch = useDispatch();
    
    // 🟢 மாற்றப்பட்ட பகுதி: state.products key மற்றும் || {} பாதுகாப்புடன்
    const { 
        similarProducts, 
        similarLoading, 
        similarError 
    } = useSelector(state => state.products || {}); // ⬅️ இதுதான் சரியான மாற்றம்

    useEffect(() => {
        // Fetch similar products when the component mounts or the ID changes
        if (currentProductId) {
            dispatch(getSimilarProducts(currentProductId));
        }
        
        // Cleanup: Clear the similar products state when the component unmounts
        return () => {
            dispatch(clearSimilarProducts());
        };
    }, [dispatch, currentProductId]);
    
    // --- Render Logic: Loading, Error, Empty State ---
    
    if (similarLoading) {
        return (
            <div className="mt-8 py-4 flex justify-center">
                <Spinner size="sm" />
            </div>
        );
    }

    if (similarError) {
        return (
            <div className="mt-8 text-center text-red-600 p-4 bg-red-50 rounded-lg">
                Error loading recommendations: {similarError}
            </div>
        );
    }
    
    // Do not render the section if no similar products are found
    if (!similarProducts || similarProducts.length === 0) {
        return null; 
    }

    // --- Content Rendering ---
    return (
        <div className="mt-12">
            <h2 className="text-2xl font-extrabold text-gray-800 border-b-2 border-lime-500 inline-block pb-1 mb-6">
                You Might Also Like
            </h2>
            
            {/* Responsive grid for displaying product cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
                {similarProducts.map((product) => (
                    // Link to the new product page
                    <Link 
                        key={product._id} 
                        to={`/product/${product._id}`} 
                        className="group block"
                        // Scroll to top on new product navigation
                        onClick={() => window.scrollTo(0, 0)} 
                    >
                        <ProductCard product={product} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SimilarProducts;