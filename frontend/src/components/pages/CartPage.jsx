import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// Import necessary UI components
import Message from '../ui/Message'
// NOTE: Button is not needed in CartPage.jsx anymore as it's used inside CartSummary.jsx

// ⭐ Import the two sub-components we created ⭐
import CartItem from '../cart/CartItem' 
import CartSummary from '../cart/CartSummary'


const CartPage = () => {
    // Only need cartItems here to check if the cart is empty
    const { cartItems } = useSelector((state) => state.cart);

    // NOTE: qtyChangeHandler, removeHandler, and checkoutHandler are REMOVED from here,
    // as they are now handled inside the CartItem.jsx and CartSummary.jsx components.

    return (
        <main className="max-w-7xl mx-auto p-4"> 
            
            <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Shopping Cart</h1>
            
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left Column: Cart Items List */}
                <section className="lg:col-span-3">
                    {cartItems.length === 0 ? (
                        <Message variant="info">
                            Your cart is empty. <Link to="/" className="text-lime-600 hover:underline">Go Back</Link>
                        </Message>
                    ) : (
                        <ul role="list" className="space-y-4">
                            {/* ⭐ Replaced the inline <li> with the dedicated CartItem component ⭐ */}
                            {cartItems.map((item) => (
                                // Pass the cart item object to the CartItem component
                                <CartItem key={item.product} item={{
                                    productId: item.product,
                                    name: item.name,
                                    price: item.price,
                                    image: item.image,
                                    qty: item.qty,
                                    countInStock: item.countInStock || 10, // Ensure countInStock exists
                                }} />
                            ))}
                        </ul>
                    )}
                </section>

                {/* Right Column: Order Summary (Calling the dedicated CartSummary component) */}
                <aside className="lg:col-span-1">
                    {/* ⭐ Calling the CartSummary component instead of inline HTML/Logic ⭐ */}
                    <CartSummary /> 
                </aside>
                
            </section>
        </main>
    );
};

export default CartPage;