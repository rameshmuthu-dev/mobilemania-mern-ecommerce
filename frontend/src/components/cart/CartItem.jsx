// src/components/cart/CartItem.jsx

import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTimes, FaRupeeSign } from 'react-icons/fa'; 
import { updateCartItem, removeItemFromCart } from '../../redux/slices/cartSlice';
import Button from '../ui/Button'; 

const CartItem = ({ item }) => {
    const dispatch = useDispatch();

    const { 
        productId, 
        name, 
        image, 
        price = 0, 
        qty = 0, 
        countInStock = 0 
    } = item;

    // Handlers remain the same
    const handleQtyChange = (newQty) => {
        if (newQty < 1) {
            dispatch(removeItemFromCart(productId));
            return;
        }

        if (newQty <= countInStock) {
            dispatch(updateCartItem({ productId: productId, qty: newQty })); 
        } else {
            alert(`Maximum quantity reached for ${name}. (Stock: ${countInStock})`);
        }
    };

    const removeHandler = () => {
        dispatch(removeItemFromCart(productId));
    };

    const subtotal = price * qty;
    const isOutOfStock = countInStock === 0;

    return (
        // Main container with full padding and border-b for item separation
        <li className="flex flex-col p-4 border-b border-gray-200 bg-white hover:bg-gray-50 transition duration-150 lg:flex-row lg:items-center">
            
            {/* 1. Image & Product Info Grouping (Always at the start) */}
            <div className="flex w-full items-start pb-3 lg:w-3/5 lg:pb-0">
                {/* Image */}
                <div className="w-16 h-16 flex-shrink-0 mr-3">
                    <img 
                        src={image} 
                        alt={name} 
                        className="w-full h-full object-cover rounded-lg border"
                    />
                </div>
                
                {/* Product Name and Price per item */}
                <div className="flex-grow min-w-0 pr-4"> 
                    <Link 
                        to={`/product/${productId}`} 
                        className="text-lg font-semibold text-gray-800 hover:text-indigo-600 line-clamp-2"
                    >
                        {name}
                    </Link>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                        <FaRupeeSign size={10} className="mr-0.5" />{price.toFixed(2)} 
                    </p>
                    {isOutOfStock && <p className="text-xs text-red-500 mt-1">Out of Stock</p>}
                </div>
            </div>
            
            {/* 2. Qty, Total, and Remove Button Grouping (Below the Name/Image, with separator) */}
            {/* ⭐ Border-t added to clearly separate this section from the Name/Image above ⭐ */}
            <div className="flex w-full lg:w-2/5 justify-between items-center pt-3 border-t border-gray-100 lg:border-t-0 lg:pt-0">
                
                {/* Quantity Selector: +/- Buttons */}
                <div className="flex-shrink-0 w-24 flex items-center justify-start space-x-1">
                    <Button
                        variant="secondary"
                        onClick={() => handleQtyChange(qty - 1)}
                        disabled={qty <= 1 || isOutOfStock} 
                        className="p-1 h-7 w-7 text-md"
                    >
                        -
                    </Button>
                    <span className="w-8 text-center text-md font-medium border-y py-1">
                        {qty}
                    </span>
                    <Button
                        variant="secondary"
                        onClick={() => handleQtyChange(qty + 1)}
                        disabled={qty >= countInStock || isOutOfStock} 
                        className="p-1 h-7 w-7 text-md"
                    >
                        +
                    </Button>
                </div>

                {/* Subtotal Display (Mobile & Desktop) */}
                <div className="flex-shrink-0 w-32 text-right mr-4"> 
                    <p className="text-lg font-bold text-gray-900 flex items-center justify-end">
                        <FaRupeeSign size={14} className="mr-0.5" />{subtotal.toFixed(2)}
                    </p>
                    <span className="text-xs text-gray-500">Item Total</span>
                </div>

                {/* Remove Button */}
                <div className="flex-shrink-0">
                    <Button 
                         variant="danger"
                        onClick={removeHandler}
                        
                        title="Remove Item"
                    >
                        <FaTimes size={16} /> 
                    </Button>
                </div>
            </div>
        </li>
    );
};

export default CartItem;