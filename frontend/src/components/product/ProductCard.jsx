import React from 'react';

import { FaStar } from 'react-icons/fa'; 
import { useDispatch } from 'react-redux';

import { updateCartItem } from '../../redux/slices/cartSlice'; 
import WishlistButton from '../ui/WishlistButton';
import Button from '../ui/Button'; 

// Rating Component (Displays stars and review count)
const Rating = ({ value, text }) => (
    <div className="flex items-center text-yellow-500">
        {Array(5).fill().map((_, i) => (
            <FaStar key={i} size={14} className={i < value ? 'text-yellow-500' : 'text-gray-300'} />
        ))}
        <span className="text-sm text-gray-500 ml-2">{text && `(${text})`}</span>
    </div>
);

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    
    // Safely destructure product properties, using || {} as a fallback for safety
    const { 
        _id, 
        name, 
        images, 
        price, 
        rating, 
        numReviews, 
        countInStock 
    } = product || {}; 
    
    const primaryImage = images && images.length > 0 
        ? images[0] 
        : '/images/no-image.png';

    // Handler to add the product to the cart.
    const addToCartHandler = async (e) => { 
        // CRITICAL FIX: Stop event propagation to prevent the button click from activating the parent <Link>
        e.stopPropagation(); 
        e.preventDefault();
        
        if (countInStock === 0) {
            return;
        }

        try {
            await dispatch(updateCartItem({ productId: _id, qty: 1 })).unwrap();
        } catch (error) {
            console.error(`Failed to add ${name} to cart:`, error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
            
            {/* Element for Image: Uses a div instead of Link to avoid the <a> nesting error */}
            <div className="block relative h-60 overflow-hidden">
                
                {/* Product Image */}
                <img 
                    src={primaryImage} 
                    alt={name} 
                    className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                />
                
                {/* Wishlist Button: Clicks must be stopped to prevent triggering parent navigation */}
                <div 
                    className="absolute top-3 right-3 z-10"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <WishlistButton product={product} isDetailPage={false} />
                </div>
            </div>

            <div className="p-4 flex flex-col justify-between flex-grow">
                
                {/* Product Name: Uses <h3> instead of Link */}
                <h3 className="text-lg font-semibold text-gray-800 transition truncate leading-snug">
                    {name}
                </h3>

                <div className="my-2">
                    <Rating 
                        value={rating} 
                        // FIX: Use || 0 to display "(0 reviews)" instead of "(undefined reviews)"
                        text={`${numReviews || 0} reviews`} 
                    />
                </div>
                
                {/* Display price with Indian Rupee symbol and formatting */}
                <p className="text-xl font-bold text-gray-900 mb-3">
                    ₹{price ? price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                </p>

                <Button 
                    onClick={addToCartHandler} 
                    className="w-full text-sm py-2 px-4"
                    disabled={countInStock === 0}
                >
                    {countInStock === 0 ? 'Out of Stock' : 'Add To Cart'}
                </Button>
            </div>
        </div>
    );
};

export default ProductCard;