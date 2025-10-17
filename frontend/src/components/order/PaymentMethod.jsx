import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../../redux/slices/orderSlice'; // Assuming this action exists

// Import your custom UI components
import Button from '../ui/Button'; 
import CheckoutSteps from '../ui/CheckoutSteps';

const PaymentMethod = () => {
    // 🔑 STEP 1: All Hooks MUST be called at the very top level
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get the current payment method and shipping address from the Redux state
    const { paymentMethod: savedPaymentMethod, shippingAddress } = useSelector((state) => state.order);

    // Local state for the selected payment method. 
    // Initialize with the saved method or default to 'Stripe/Credit Card'
    const [paymentMethod, setPaymentMethod] = useState(savedPaymentMethod || 'Stripe/Credit Card'); 

    // 🔑 STEP 2: Use an effect for navigation checks, after all hooks are called
    useEffect(() => {
        // Redirect if shipping address is missing (ensures flow)
        if (!shippingAddress || !shippingAddress.address) {
            navigate('/shipping');
        }
    }, [navigate, shippingAddress]);


    const submitHandler = (e) => {
        e.preventDefault();
        
        // Dispatch the selected payment method to the Redux store
        dispatch(savePaymentMethod(paymentMethod));
        
        // Navigate to the final step
        navigate('/placeorder');
    };

    return (
        <main className="max-w-xl mx-auto p-4">
            {/* Highlight step 3: Payment */}
            <CheckoutSteps step1={true} step2={true} step3={true} /> 

            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Payment Method</h1>

            <form onSubmit={submitHandler} className="bg-white p-6 rounded-lg shadow-xl border border-gray-100">
                <div className="space-y-4">
                    
                    {/* Option 1: Stripe / Credit Card */}
                    <div className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150">
                        <input
                            id="creditcard"
                            type="radio"
                            name="paymentMethod"
                            value="CreditCard" // Use a clear backend value
                            checked={paymentMethod === 'CreditCard'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300"
                        />
                        <label htmlFor="creditcard" className="ml-3 block text-base font-medium text-gray-700">
                            Stripe / Credit Card 
                            <span className="text-sm text-gray-500 ml-2">(Pay securely online)</span>
                        </label>
                    </div>

                  
                    
                    {/* Option 3: Cash on Delivery (COD) */}
                    <div className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150">
                        <input
                            id="cod"
                            type="radio"
                            name="paymentMethod"
                            value="Cash on Delivery (COD)"
                            checked={paymentMethod === 'Cash on Delivery (COD)'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300"
                        />
                        <label htmlFor="cod" className="ml-3 block text-base font-medium text-gray-700">
                            Cash on Delivery (COD) 
                            <span className="text-sm text-gray-500 ml-2">(Pay when you receive the order)</span>
                        </label>
                    </div>

                </div>

                <Button
                    type="submit"
                    variant="success"
                    className="w-full mt-8 text-lg"
                    disabled={!paymentMethod} // Disable if nothing is selected
                >
                    Continue to Place Order
                </Button>
            </form>
        </main>
    );
};

export default PaymentMethod;