const express = require('express');
const Stripe = require('stripe');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User');
const { createInvoicePdf } = require('../services/invoiceService');
const { sendEmail } = require('../services/emailService');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// IMPORTANT: This route uses express.raw() and must be mounted before express.json()
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        try {
            const order = await Order.findById(orderId).populate('user');
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                await order.save();
                console.log(`Order ${orderId} updated to paid in DB.`);

                const user = await User.findById(order.user._id);
                if (user) {
                    const invoicePdf = await createInvoicePdf(order, user);
                    const subject = 'Your Mobile Mania Order Invoice';
                    const text = `Hi ${user.firstName},\n\nThank you for your purchase! Your invoice is attached to this email.`;
                    const attachments = [{
                        filename: `invoice-${order._id}.pdf`,
                        content: invoicePdf,
                        contentType: 'application/pdf'
                    }];
                    await sendEmail(user.email, subject, text, attachments);
                }
            }
            res.json({ received: true });
        } catch (error) {
            console.error(`Error processing webhook: ${error.message}`);
            res.status(500).send('Server Error');
        }
    } else {
        res.status(400).end();
    }
}));

module.exports = router;