const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

const createCheckoutSession = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            res.status(400);
            throw new Error('Order ID is required to create a checkout session');
        }

        const order = await Order.findById(orderId).populate('orderItems.product', 'name description images');

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        const lineItems = order.orderItems.map(item => {
            // Check if product data exists before accessing its properties
            if (!item.product) {
                // If product is missing, throw a more descriptive error.
                res.status(400);
                throw new Error('Product not found for one of the order items.');
            }

            return {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.product.name,
                        description: item.product.description,
                        images: item.product.images,
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.qty,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
          
            success_url: `${process.env.FRONTEND_URL}/order/${orderId}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/placeorder`,
            metadata: {
                orderId: orderId,
            }
        });

        res.json({
            id: session.id,
            checkoutUrl: session.url,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
    } catch (error) {
        console.error("Error in createCheckoutSession:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    createCheckoutSession
};