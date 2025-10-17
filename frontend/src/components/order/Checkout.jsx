// src/pages/order/Checkout.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCreditCard, FaCheckCircle } from 'react-icons/fa';

// Import Checkout Step Components
import ShippingAddress from '../../components/order/ShippingAddress'; 
import PaymentMethod from '../../components/order/PaymentMethod'; 
import PlaceOrder from '../../components/order/PlaceOrder'; 

// --- Helper Component: CheckoutSteps (FIXED to Dot/Rounded Style) ---
// Component for visualizing the checkout progress
const CheckoutSteps = ({ currentStep }) => { 
    // Define the 3 steps (Sign In removed)
    const steps = [
        { id: 1, name: 'Shipping', icon: FaMapMarkerAlt },
        { id: 2, name: 'Payment', icon: FaCreditCard },
        { id: 3, name: 'Place Order', icon: FaCheckCircle },
    ];

    return (
        <div className="flex justify-between items-start w-full mb-10 max-w-2xl mx-auto relative">
            
            {/* Connector Lines */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-10">
                {/* Line 1: Shipping to Payment - Activates when currentStep is 2 or more */}
                <div className="flex-1 border-t-2 mx-4 h-0" style={{ borderColor: currentStep >= 2 ? '#4ade80' : '#d1d5db' }}></div>
                {/* Line 2: Payment to Place Order - Activates when currentStep is 3 or more */}
                <div className="flex-1 border-t-2 mx-4 h-0" style={{ borderColor: currentStep >= 3 ? '#4ade80' : '#d1d5db' }}></div>
            </div>

            {steps.map((step) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;

                return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center w-1/3">
                        {/* Dot/Icon Circle: Fixed to show checkmark, number, or simple dot */}
                        <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 
                                ${isCompleted ? 'bg-lime-500 text-white' : 
                                  isActive ? 'bg-lime-500 text-white shadow-lg border-2 border-lime-700' : 
                                  'bg-white border-2 border-gray-400 text-transparent'}` // Simple gray dot/circle for inactive/uncompleted
                            }
                        >
                            {/* Display checkmark for completed steps, otherwise display the step number for active step */}
                            {isCompleted ? <FaCheckCircle className="text-sm" /> : 
                             isActive ? <span className="font-bold text-sm">{step.id}</span> : 
                             <span className="w-2 h-2 rounded-full bg-gray-400"/> // Small dot filler for inactive steps
                            }
                        </div>

                        {/* Step Name */}
                        <span className={`mt-2 text-sm font-semibold transition-colors duration-300 text-center
                            ${isCompleted || isActive ? 'text-lime-600' : 'text-gray-500'}`
                        }
                        >
                            {step.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// --- Helper Function: Calculate Prices (kept as is) ---
const calculatePrices = (cartItems) => {
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 10000 ? 0 : 100; // Free shipping logic
    const taxPrice = 0.15 * itemsPrice; // 15% tax example
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    return {
        itemsPrice: Number(itemsPrice.toFixed(2)),
        shippingPrice: Number(shippingPrice.toFixed(2)),
        taxPrice: Number(taxPrice.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
    };
};


const Checkout = () => {
    const navigate = useNavigate();
    
    // Get cart data and check for saved information
    const { cartItems, shippingAddress, paymentMethod } = useSelector((state) => state.cart);

    // Determine the initial step based on saved data
    // Steps are: 1: Shipping, 2: Payment, 3: Place Order
    let initialStep = 1;
    if (shippingAddress) initialStep = 2;
    if (shippingAddress && paymentMethod) initialStep = 3;

    // State to track the current step 
    const [currentStep, setCurrentStep] = useState(initialStep); 

    // Redirect if cart is empty
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart'); 
        }
    }, [cartItems, navigate]);

    // Function to handle moving to the next step
    const handleNextStep = () => {
        // Only move forward if not past the final step (Step 3)
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        }
    }
    
    // Determine which component to render based on the current step
    let stepComponent;
    
    if (currentStep === 1) {
        stepComponent = <ShippingAddress onNextStep={handleNextStep} />;
    } else if (currentStep === 2) {
        stepComponent = <PaymentMethod onNextStep={handleNextStep} />; 
    } else if (currentStep === 3) {
        // Step 3 (PlaceOrder) will handle the final order placement logic and redirection itself
        stepComponent = <PlaceOrder />; 
    } else {
        stepComponent = <div className="text-center text-red-500">Invalid Checkout Step</div>;
    }
    
    // Calculate Prices for Order Summary (Right Column)
    const prices = calculatePrices(cartItems);


    return (
        <main className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Checkout</h1>
            
            {/* Checkout Progress Stepper - Now displays 3 steps with dots/lines */}
            <CheckoutSteps currentStep={currentStep} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* 1. Main Content (Current Step Component) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    
                    {/* Render the current step component */}
                    {stepComponent}

                </div>

                {/* 2. Order Summary (Right Column) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 lg:sticky lg:top-4 h-fit">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-800">Order Summary</h2>
                    
                    {/* Pricing Display */}
                    <div className="space-y-3 mb-6 text-gray-700">
                        <div className="flex justify-between">
                            <span>Items ({cartItems.length}) Price:</span> 
                            <span className="font-semibold">₹{prices.itemsPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (15%):</span> 
                            <span className="font-semibold">₹{prices.taxPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping:</span> 
                            <span className={`font-semibold ${prices.shippingPrice === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                                {prices.shippingPrice === 0 ? 'FREE' : `₹${prices.shippingPrice.toLocaleString('en-IN')}`}
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-3 font-extrabold text-xl text-gray-900">
                            <span>Order Total:</span> 
                            <span>₹{prices.totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    
                    {currentStep < 3 && (
                        <p className="mt-4 text-center text-sm text-lime-600 font-semibold">
                            Complete the current step to view the final summary.
                        </p>
                    )}
                </div>

            </div>
        </main>
    );
};

export default Checkout;