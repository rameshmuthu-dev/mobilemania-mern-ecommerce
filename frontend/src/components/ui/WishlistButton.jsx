import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addToWishlist, removeFromWishlist, getWishlist } from '../../redux/slices/wishlistSlice';

// Imported React Icons (Ant Design Icons)
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'; 

const WishlistButton = ({ product, isDetailPage = false }) => {
    const dispatch = useDispatch();
    
    // Get user and wishlist states
    const { user: userInfo } = useSelector(state => state.auth); 
    const { items: wishlistItems, loading } = useSelector(state => state.wishlist);

    // CRITICAL FIX: Check if the current product ID exists in the wishlist items array.
    // The wishlistItems array contains populated objects: { product: { _id, ... } }
    const isWished = wishlistItems.some(item => 
        // Ensure item.product and its _id exist before comparing
        item.product && item.product._id && item.product._id.toString() === product._id.toString()
    ); 

    // Fetch wishlist items on mount if the user is logged in
    useEffect(() => {
        if (userInfo) {
            // Fetch the wishlist only if it hasn't been loaded yet
            if (wishlistItems.length === 0) { 
                dispatch(getWishlist());
            }
        }
    }, [dispatch, userInfo, wishlistItems.length]);


    const handleWishlistToggle = () => {
        if (!userInfo) {
            toast.error("Please sign in to manage your Wishlist.");
            return;
        }
        
        if (isWished) {
            // The removeFromWishlist thunk expects the productId
            dispatch(removeFromWishlist(product._id));
        } else {
            // The addToWishlist thunk expects the productId
            dispatch(addToWishlist(product._id));
        }
    };

    // Base class for the button
    const buttonClass = isDetailPage 
        ? "flex items-center justify-center w-full bg-white text-gray-800 border border-gray-300 py-2 rounded-lg hover:bg-lime-50 hover:border-lime-500 transition duration-150"
        : "p-2 rounded-full shadow-md transition duration-150";

    return (
        <button 
            onClick={handleWishlistToggle} 
            disabled={loading}
            // Conditional styling based on whether the product is in the wishlist
            className={`${buttonClass} ${isWished 
                ? 'text-lime-600 bg-lime-100 border-lime-400' // WISHED: Solid color, green background
                : 'text-gray-400 hover:text-lime-600 hover:bg-gray-50' // NOT WISHED: Gray outline, green on hover
            }`}
            aria-label={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
            {loading ? (
                // Simple loading spinner indicator
                <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-lime-500 rounded-full" />
            ) : (
                <>
                    {/* Render solid heart if wished, outline heart otherwise */}
                    {isWished ? (
                        <AiFillHeart className="w-6 h-6 fill-current" />
                    ) : (
                        <AiOutlineHeart className="w-6 h-6 stroke-current" />
                    )}
                    {/* Display text only on the detail page */}
                    {isDetailPage && (
                        <span className="ml-2 font-semibold">
                            {isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </span>
                    )}
                </>
            )}
        </button>
    );
};

export default WishlistButton;