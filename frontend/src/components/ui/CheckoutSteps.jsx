// src/components/order/CheckoutSteps.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCreditCard, FaCheckCircle } from 'react-icons/fa';

/**
 * @desc Displays the 3-step checkout progress (Shipping, Payment, Place Order)
 * using a dot and line visual style. 'Sign In' step is removed.
 * @param {boolean} step2 - Indicates if Shipping is completed/active (now Step 1 logic)
 * @param {boolean} step3 - Indicates if Payment is completed/active (now Step 2 logic)
 * @param {boolean} step4 - Indicates if Place Order is completed/active (now Step 3 logic)
 */
const CheckoutSteps = ({ step2, step3, step4 }) => {
    
    // Determine the current step number (1, 2, or 3) based on the progress props.
    let currentStep = 1; 
    if (step3) currentStep = 2; 
    if (step4) currentStep = 3; 

    const steps = [
        { id: 1, name: 'Shipping', route: '/shipping' },
        { id: 2, name: 'Payment', route: '/paymentmethod' },
        { id: 3, name: 'Place Order', route: '/placeorder' },
    ];

    return (
        <nav className="flex justify-center mb-8 max-w-2xl mx-auto" aria-label="Checkout progress">
            
            <div className="flex justify-between items-start w-full relative">
            
                {/* Connector Lines: Must be rendered first to appear behind the dots */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-10">
                    {/* Line 1: Shipping to Payment */}
                    <div className="flex-1 border-t-2 mx-4 h-0" style={{ borderColor: currentStep >= 2 ? '#4ade80' : '#d1d5db' }}></div>
                    {/* Line 2: Payment to Place Order */}
                    <div className="flex-1 border-t-2 mx-4 h-0" style={{ borderColor: currentStep >= 3 ? '#4ade80' : '#d1d5db' }}></div>
                </div>

                {/* Step Items */}
                {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    const isClickable = isCompleted || isActive; // Allow navigation to completed or current steps

                    const StepContent = (
                        <div key={step.id} className="relative z-10 flex flex-col items-center w-1/3">
                            {/* Dot/Icon Circle */}
                            <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 
                                    ${isCompleted ? 'bg-lime-500 text-white' : 
                                      isActive ? 'bg-lime-500 text-white shadow-lg border-2 border-lime-700' : 
                                      'bg-white border-2 border-gray-400 text-transparent'}`
                                }
                            >
                                {/* Content inside the dot: Checkmark, Step Number, or small gray filler dot */}
                                {isCompleted ? <FaCheckCircle className="text-sm" /> : 
                                 isActive ? <span className="font-bold text-sm">{step.id}</span> : 
                                 <span className="w-2 h-2 rounded-full bg-gray-400"/>
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

                    // Render StepContent wrapped in a Link if clickable
                    return isClickable ? (
                        <Link to={step.route} key={`link-${step.id}`} className="block hover:opacity-80 transition">
                            {StepContent}
                        </Link>
                    ) : (
                        // Render StepContent without a Link if inactive
                        <div key={`div-${step.id}`} className="block pointer-events-none">
                            {StepContent}
                        </div>
                    );
                })}
            </div>
        </nav>
    );
};

// Set default props for safety, matching the names used in the component's parent
CheckoutSteps.defaultProps = {
    step2: false, 
    step3: false, 
    step4: false, 
};

export default CheckoutSteps;