import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaRupeeSign } from 'react-icons/fa';
import Button from '../ui/Button'; 
import { setCheckoutDetails } from '../../redux/slices/orderSlice';

const CartSummary = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { 
        cartItems, 
        itemsPrice, 
        shippingPrice, 
        taxPrice, 
        totalPrice 
    } = useSelector((state) => state.cart);

    const { user } = useSelector((state) => state.auth); 

    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

    const checkoutHandler = () => {
        if (cartItems.length === 0) return;

        if (!user) {
            navigate('/login?redirect=/shipping');
            return; 
        }

        dispatch(setCheckoutDetails({
            orderItems: cartItems, 
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        }));

        navigate('/shipping'); 
    };

    return (
        <div className="p-6 rounded-lg shadow-xl bg-white border border-gray-100 sticky top-24 h-fit">
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center">
                <FaShoppingCart className="mr-3 text-indigo-600" /> Cart Summary
            </h2>
            
            <ul className="space-y-3">
                <li className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-700">Subtotal ({totalItems} items):</span>
                    <span className="font-bold text-gray-900 flex items-center">
                       <FaRupeeSign size={15} className="mr-0.5" />{itemsPrice.toFixed(2)}
                    </span>
                </li>

                <li className="flex justify-between items-center text-md text-gray-600">
                    <span>Shipping Charge:</span>
                    <span className="flex items-center">
                       <FaRupeeSign size={10} className="mr-0.5" />{shippingPrice.toFixed(2)}
                    </span>
                </li>

                <li className="flex justify-between items-center text-md text-gray-600">
                    <span>GST/Tax:</span>
                    <span className="flex items-center">
                       <FaRupeeSign size={10} className="mr-0.5" />{taxPrice.toFixed(2)}
                    </span>
                </li>
                
                <li className="flex justify-between items-center text-xl pt-3 border-t border-dashed">
                    <span className="font-bold text-gray-800">Grand Total:</span>
                    <span className="font-extrabold text-indigo-600 flex items-center">
                       <FaRupeeSign size={16} className="mr-0.5" />{totalPrice.toFixed(2)}
                    </span>
                </li>
            </ul>

            <div className="pt-4 mt-4">
                <Button
                    onClick={checkoutHandler}
                    variant="gradient" 
                    disabled={cartItems.length === 0}
                    className="w-full text-lg py-3"
                >
                    Proceed To Checkout
                </Button>
            </div>

            {cartItems.length === 0 && (
                <p className="text-sm text-center text-red-500 mt-2">
                    Your cart is empty. Please add items to proceed.
                </p>
            )}
        </div>
    );
};

export default CartSummary;