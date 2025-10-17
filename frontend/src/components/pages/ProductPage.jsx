// src/pages/ProductPage.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { FaShoppingCart, FaArrowLeft, FaRupeeSign } from 'react-icons/fa';

// Components
import Spinner from '../ui/Spinner'; 
import Message from '../ui/Message'; 
import Button from '../ui/Button'; 

// Redux Thunks
import { getProductDetails } from '../../redux/slices/productSlice' 
import { updateCartItem } from '../../redux/slices/cartSlice'

// Placeholder for Rating component (Using the logic you provided previously)
const Rating = ({ value, text }) => {
    const starArray = Array.from({ length: 5 }, (_, index) => {
        const full = index + 1 <= value;
        const half = index + 0.5 === value;
        return (
            <span key={index} className={full ? 'text-yellow-500' : 'text-gray-300'}>
                {full || half ? '★' : '☆'}
            </span>
        );
    });
    return (
        <div className="flex items-center text-sm">
            {starArray}
            <span className="text-gray-600 ml-2 text-sm">({text})</span>
        </div>
    );
};

const ProductPage = () => { // Changed component name to ProductPage
    const dispatch = useDispatch();
    const { id: productId } = useParams(); 

    // Getting 'productDetails' from the Redux state
    const { productDetails, isLoading, isError, message } = useSelector((state) => state.products); 
    
    // Local State for quantity selection
    const [qty, setQty] = useState(1);

    // Fetch product details when component loads or ID changes
    useEffect(() => {
        if (productId) {
            dispatch(getProductDetails(productId));
        }
    }, [dispatch, productId]);

    // Handler for Add to Cart button (Uses the correct Redux Thunk)
    const addToCartHandler = () => {
        dispatch(updateCartItem({ productId, qty })); 
    };

    const product = productDetails; 

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/" className="text-lime-600 hover:text-lime-800 flex items-center mb-6 font-medium">
                <FaArrowLeft className="mr-2" /> Back to Products
            </Link>

            {isLoading ? (
                <Spinner />
            ) : isError ? (
                <Message variant="danger">{message}</Message>
            ) : product ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Column 1: Product Images */}
                    <div className="lg:col-span-1">
                        <img 
                            src={product.image } 
                            alt={product.name} 
                            className="w-full h-auto rounded-lg shadow-lg object-contain"
                        />
                    </div>

                    {/* Column 2: Details and Description */}
                    <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-200 pr-6 pb-6">
                        <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
                        
                        <div className="mb-4">
                            <Rating value={product.rating || 0} text={`${product.numReviews || 0} reviews`} />
                        </div>
                        
                        <p className="text-gray-700 mb-4 text-lg flex items-center">
                            Price: 
                            <span className="text-3xl font-extrabold text-lime-600 ml-2 flex items-center">
                                <FaRupeeSign size={20} className="mr-0.5" />{product.price.toFixed(2)}
                            </span>
                        </p>

                        <h2 className="text-xl font-semibold mt-6 mb-2">Description:</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    {/* Column 3: Add to Cart Box */}
                    <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
                        <div className="flex justify-between items-center border-b pb-3 mb-3">
                            <span className="text-xl font-semibold">Price:</span>
                            <span className="text-2xl font-bold flex items-center">
                                <FaRupeeSign size={18} className="mr-0.5" />{product.price.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <span className="text-xl font-semibold">Status:</span>
                            <span 
                                className={`font-bold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        {/* Quantity Selector (only if in stock) */}
                        {product.countInStock > 0 && (
                            <div className="flex justify-between items-center border-b pb-3 mb-4">
                                <span className="text-xl font-semibold">Qty:</span>
                                <select 
                                    value={qty} 
                                    onChange={(e) => setQty(Number(e.target.value))}
                                    className="p-2 border rounded-lg focus:ring-lime-500 focus:border-lime-500"
                                >
                                    {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                                        <option key={x + 1} value={x + 1}>
                                            {x + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Add to Cart Button */}
                        <Button
                            onClick={addToCartHandler}
                            disabled={product.countInStock === 0}
                            variant="gradient" 
                            className="w-full mt-4 flex items-center justify-center text-xl"
                        >
                            <FaShoppingCart className="mr-3" /> Add To Cart
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default ProductPage;