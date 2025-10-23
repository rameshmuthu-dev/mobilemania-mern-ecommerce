// src/pages/order/OrderSuccess.jsx

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

// Import your reusable Button component
import Button from '../../components/ui/Button';

const OrderSuccess = () => {
    // Get the orderId directly from the URL path
    const { orderId } = useParams();
    const navigate = useNavigate();

    // Handler to navigate back to the Home Page
    const handleReturnHome = () => {
        // Cleanup (clearing cart, shipping address, etc.) is handled by 
        // the createOrder.fulfilled logic in your orderSlice.js
        navigate('/');
    };

    return (
        <main className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full text-center border border-green-200">

                {/* Success Icon */}
                <FaCheckCircle className="text-7xl text-green-500 mx-auto mb-6 animate-pulse" />

                <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
                    Order Placed Successfully! 🎉
                </h1>

                <p className="text-lg text-gray-600 mb-8">
                    Thank you for your purchase. Your order has been confirmed.
                </p>

                {/* Display Order ID */}
                {orderId && (
                    <div className="bg-green-50 p-3 rounded-lg mb-8 w-full">
                        <p className="text-xl font-semibold text-green-700 break-words">
                            Order ID: <span className="font-extrabold">{orderId}</span>
                        </p>
                    </div>
                )}

                {/* --- Navigation Buttons --- */}
                <div className="space-y-4">

                    {/* View Order Details Button (Takes user to the dedicated OrderDetailsPage) */}
                    {orderId && (
                        <Button
                            onClick={() => navigate(`/order/${orderId}`)}
                            variant="secondary" // Assuming a secondary style exists in Button.jsx
                            className="w-full sm:w-auto mx-auto"
                        >
                            View Order Details
                        </Button>
                    )}

                    {/* Return to Home Button */}
                    <Button
                        onClick={handleReturnHome}
                        className="w-full sm:w-auto mx-auto"
                    >
                        Return to Home
                    </Button>
                </div>

            </div>
        </main>
    );
};

export default OrderSuccess;