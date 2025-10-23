// File: PlaceOrder.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api'
import { clearCartItems } from '../../redux/slices/cartSlice';

// Stripe SDK (Requires: npm install @stripe/stripe-js)
import { loadStripe } from '@stripe/stripe-js';

// Assume these are your custom UI components
import Button from '../ui/Button';
import CheckoutSteps from '../ui/CheckoutSteps'
import Message from '../ui/Message';
import Spinner from '../ui/Spinner';


// Helper function to format price consistently as Rupee
// Note: The price comes in as a string from the Redux state (e.g., "50000.00")
const formatRupee = (priceString) => {
    // Convert to float, then format for Indian locale
    if (!priceString) return '₹0.00';
    try {
        const price = parseFloat(priceString);
        return '₹' + price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (e) {
        return '₹' + priceString; // Fallback
    }
}

// Helper function to format the product item's price (which might be a raw number)
const formatItemRupee = (priceValue) => {
    if (typeof priceValue === 'string') {
        priceValue = parseFloat(priceValue);
    }
    if (isNaN(priceValue)) return '₹0';
    return '₹' + priceValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


const PlaceOrder = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // We only need the items and price breakdown from the unified orderDetails state
    const orderDetails = useSelector((state) => state.order);
    const { shippingAddress, paymentMethod, checkoutDetails } = orderDetails;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Destructure the items and prices from the unified checkoutDetails object
    const {
        orderItems = [],
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice
    } = checkoutDetails || {};


    // Redirect if order prerequisites are missing
    useEffect(() => {
        // Redirect if orderItems are empty
        if (orderItems.length === 0) {
            navigate('/');
        }
        // Redirect if address is missing
        else if (!shippingAddress || !shippingAddress.address) {
            navigate('/shipping');
        }
        // Redirect if payment method is missing
        else if (!paymentMethod) {
            navigate('/paymentmethod');
        }
    }, [navigate, orderItems.length, shippingAddress, paymentMethod]);


    const placeOrderHandler = async () => {
        // Check if items array is truly empty before proceeding
        if (orderItems.length === 0) {
            setError('Cannot place order. Order items list is empty.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Create the Order in the Backend (POST /api/orders)
            const orderPayload = {
                orderItems: orderItems,
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
                // Include calculated prices in the payload
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            };

            const orderResponse = await API.post('/orders', orderPayload);
            const createdOrder = orderResponse.data;

            // 2. Handle Cash on Delivery (COD) Flow
            if (paymentMethod === 'Cash on Delivery (COD)') {
                dispatch(clearCartItems());
                setIsLoading(false);
                // Navigate to Order Details page
                navigate(`/order/${createdOrder._id}/success`);
                return;
            }

            // 3. Handle Stripe/Credit Card Flow
            else if (paymentMethod === 'CreditCard') {

                // Call Payment Controller (POST /api/payment/create-checkout-session)
                const stripeResponse = await API.post('/payment/create-checkout-session', {
                    orderId: createdOrder._id
                });

                const { id: sessionId, publishableKey } = stripeResponse.data;

                // Load Stripe and Redirect to checkout page
                const stripe = await loadStripe(publishableKey);
                const result = await stripe.redirectToCheckout({ sessionId });

                if (result.error) {
                    setError(`Payment failed to start: ${result.error.message}`);
                }
            }
        } catch (err) {
            console.error("Order Placement Error:", err);
            setError(err.response?.data?.message || err.message || 'Order Placement Failed');
        } finally {
            // Stop the spinner only if we didn't redirect (i.e., COD or error)
            if (!error && paymentMethod !== 'CreditCard') {
                setIsLoading(false);
            }
        }
    };


    return (
        <main className="max-w-7xl mx-auto p-4">
            <CheckoutSteps step1={true} step2={true} step3={true} step4={true} />
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Place Order</h1>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="md:col-span-2 space-y-6">

                    {/* Shipping Info */}
                    <article className="border p-4 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-2 text-lime-700">Shipping</h2>
                        <address>
                            <p><strong>Name:</strong> {shippingAddress?.name}</p>
                            <p><strong>Address:</strong> {shippingAddress?.address}, {shippingAddress?.city}, {shippingAddress?.postalCode}, {shippingAddress?.country}</p>
                            <p><strong>Mobile:</strong> {shippingAddress?.mobileNumber}</p>
                        </address>
                    </article>

                    {/* Payment Info */}
                    <article className="border p-4 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-2 text-lime-700">Payment Method</h2>
                        <p><strong>Method:</strong> {paymentMethod}</p>
                    </article>

                    {/* Order Items List */}
                    <section className="border p-4 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-2 text-lime-700">Order Items</h2>
                        {orderItems.length === 0 ? (
                            <Message variant="info">Order items list is empty. Please check your cart or buy a product.</Message>
                        ) : (
                            <ul role="list" className="space-y-3">
                                {orderItems.map((item, index) => (
                                    <li key={index} className="flex justify-between items-center border-b pb-2">
                                        <div className="flex-1">
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            {/* 🎯 FIX 1: Use Rupee format for individual item price and total */}
                                            {item.qty} x {formatItemRupee(item.price)} = {formatItemRupee(item.qty * item.price)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                {/* Right Column: Order Summary and Action Button */}
                <aside className="md:col-span-1">
                    <div className="border p-4 rounded-lg shadow-lg bg-gray-50 sticky top-4">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Order Summary</h2>
                        <ul role="list" className="space-y-2">
                            {/* 🎯 FIX 2: Use formatRupee helper function for all summary prices */}
                            <li className="flex justify-between">Items: <span>{formatRupee(itemsPrice)}</span></li>
                            <li className="flex justify-between">Shipping: <span>{formatRupee(shippingPrice)}</span></li>
                            <li className="flex justify-between">Tax (18%): <span>{formatRupee(taxPrice)}</span></li>
                            <li className="flex justify-between pt-2 border-t font-bold text-lg">Total: <span>{formatRupee(totalPrice)}</span></li>
                        </ul>

                        {/* Display Errors */}
                        {error && <Message variant="danger" className="mt-4">{error}</Message>}

                        <Button
                            type="button"
                            className="w-full mt-6 bg-lime-600 hover:bg-lime-700"
                            onClick={placeOrderHandler}
                            // Disable if no items or loading
                            disabled={orderItems.length === 0 || isLoading}
                        >
                            {isLoading ? <Spinner /> : 'Place Order'}
                        </Button>
                    </div>
                </aside>
            </section>
        </main>
    );
};

export default PlaceOrder;