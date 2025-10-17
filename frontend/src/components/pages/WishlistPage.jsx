// src/components/pages/WishlistPage.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { getWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import Message from '../ui/Message'; 
import Spinner from '../ui/Spinner';   


const WishlistPage = () => { 
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user: userInfo } = useSelector((state) => state.auth);
    const { items: wishlistItems, loading, error, message } = useSelector((state) => state.wishlist);
    const { cartItems } = useSelector((state) => state.cart); 

    // Fetch wishlist on mount
    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else if (wishlistItems.length === 0) {
            dispatch(getWishlist());
        }
    }, [dispatch, navigate, userInfo, wishlistItems.length]);


    const handleRemoveFromWishlist = (productId) => {
        // Dispatch action to remove the item using its product ID
        dispatch(removeFromWishlist(productId))
            .unwrap()
            .then(() => {
                toast.success('Product removed from Wishlist');
            })
            .catch((err) => {
                toast.error(err || 'Failed to remove from wishlist');
            });
    };

    const handleAddToCart = (item) => {
        const productId = item.product._id; 
        
        // Check if the item is already in the cart
        const alreadyInCart = cartItems.some(cartItem => cartItem.product === productId);

        if (alreadyInCart) {
            toast.info('Item is already in your cart!');
            navigate('/cart');
        } else {
            // NOTE: Replace this with your actual Redux action to add to cart
            // Example: dispatch(addToCart({ id: productId, qty: 1 }));
            toast.success(`Added ${item.product.name} to cart. (Please implement actual addToCart dispatch)`);
            
            // Optionally remove from wishlist after moving to cart
            handleRemoveFromWishlist(productId); 
            navigate('/cart');
        }
    };


    if (loading && wishlistItems.length === 0) {
        return <Spinner />;
    }

    if (error && wishlistItems.length === 0) {
        return <Message variant="danger">{error || message}</Message>;
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <Link 
                to="/" 
                className="inline-flex items-center text-gray-600 hover:text-lime-600 transition mb-6 font-medium"
            >
                <FaArrowLeft className="mr-2" /> Back to Shopping
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-3">
                Your Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'})
            </h1>

            {wishlistItems.length === 0 ? (
                <Message variant="info">
                    Your wishlist is empty. <Link to="/" className="text-lime-600 font-semibold hover:underline">Start shopping!</Link>
                </Message>
            ) : (
                <div className="space-y-4">
                    {wishlistItems.map((item) => (
                        <div 
                            key={item._id} 
                            className="flex flex-col md:flex-row items-center border border-gray-200 p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition duration-200"
                        >
                            {/* Product Image */}
                            <div className="w-20 h-20 overflow-hidden rounded-md mr-4 mb-4 md:mb-0 flex-shrink-0">
                                <img 
                                    src={item.product.image} 
                                    alt={item.product.name} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>

                            {/* Product Details */}
                            <div className="flex-grow text-center md:text-left">
                                <Link 
                                    to={`/product/${item.product._id}`} 
                                    className="text-lg font-semibold text-gray-800 hover:text-lime-600 transition"
                                >
                                    {item.product.name}
                                </Link>
                                <p className="text-sm text-gray-500">
                                    Price: <span className="font-bold text-lg text-lime-600">₹{item.product.price.toFixed(2)}</span>
                                </p>
                                <p className={`text-sm font-medium ${item.product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Status: {item.product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                                </p>
                            </div>

                            {/* Actions (Add to Cart / Remove) */}
                            <div className="mt-4 md:mt-0 md:ml-6 flex space-x-3">
                                
                                {/* Add to Cart Button */}
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    disabled={item.product.countInStock === 0}
                                    className="flex items-center px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                >
                                    <FaShoppingCart className="mr-2" /> 
                                    {item.product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                
                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemoveFromWishlist(item.product._id)}
                                    className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition duration-150"
                                    aria-label="Remove item from wishlist"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;