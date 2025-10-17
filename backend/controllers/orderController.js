const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User'); // Assuming User model is needed for populating/email
const Product = require('../models/Product');
const { createInvoicePdf } = require('../services/invoiceService');
const { sendEmail } = require('../services/emailService');

// Helper function to round numbers to two decimal places
const roundToTwoDecimals = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
};

// =================================================================================
// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Requires login)
// =================================================================================
const createOrder = asyncHandler(async (req, res) => {
    // Authentication Check (Handled by 'protect' middleware in the router)
    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error("User not authorized. Please log in to place an order.");
    }

    // We don't expect paymentResult/token here because we use Stripe Checkout Session flow.
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error("No order items");
    }

    // --- 1. Product Validation and Price Calculation ---
    const validatedOrderItems = [];
    for (const item of orderItems) {
        const productFromDB = await Product.findById(item.product);
        if (!productFromDB) {
            res.status(404);
            throw new Error(`Product not found for ID: ${item.product}`);
        }

        validatedOrderItems.push({
            name: productFromDB.name,
            qty: item.qty,
            price: productFromDB.price,
            product: productFromDB._id,
        });
    }

    const itemsPriceUnrounded = validatedOrderItems.reduce(
        (acc, item) => acc + item.qty * item.price,
        0
    );

    // Free shipping if total is above 10000 INR
    const shippingPriceUnrounded = itemsPriceUnrounded > 10000 ? 0 : 50;
    const taxPriceUnrounded = itemsPriceUnrounded * 0.18;
    const totalPriceUnrounded = itemsPriceUnrounded + shippingPriceUnrounded + taxPriceUnrounded;

    const itemsPrice = roundToTwoDecimals(itemsPriceUnrounded);
    const shippingPrice = roundToTwoDecimals(shippingPriceUnrounded);
    const taxPrice = roundToTwoDecimals(taxPriceUnrounded);
    const totalPrice = roundToTwoDecimals(totalPriceUnrounded);

    // --- 2. Order Database Preparation ---

    let isPaid = false; // Initial status is false for both Stripe and COD
    let paidAt = null;
    let paymentDetails = null;

    // Validate payment method selection
    if (paymentMethod !== 'Cash on Delivery (COD)' &&
        paymentMethod !== 'CreditCard') {
        res.status(400);
        throw new Error("Invalid payment method selected. Must be 'Cash on Delivery (COD)' or 'CreditCard'.");
    }

    // --- 3. Save the Order to Database ---

    const order = new Order({
        user: req.user._id, // User ID from 'protect' middleware
        orderItems: validatedOrderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        isPaid: isPaid, // Initially false for both
        paidAt: paidAt,
        paymentResult: paymentDetails,
    });

    const createdOrder = await order.save();

    // --- 4. Handle Cash on Delivery (COD) Flow ---
    if (paymentMethod === 'Cash on Delivery (COD)') {
        try {
            // Generate Invoice PDF
            const pdfBuffer = await createInvoicePdf(createdOrder, req.user);
            const userEmail = req.user.email;
            const subject = `Order Confirmation (COD) #${createdOrder._id}`;
            const emailContent = `Thank you for your COD purchase! Your order (ID: ${createdOrder._id}) has been successfully placed. Payment will be collected upon delivery. Please find the attached invoice.`;

            // Send Email with Invoice Attachment
            await sendEmail(userEmail, subject, emailContent, pdfBuffer);
            console.log(`COD order confirmation email sent to ${userEmail}`);

            res.status(201).json(createdOrder);
            return; // End API call for COD
        } catch (emailError) {
            console.error('ERROR: Failed to send COD confirmation email. (Order was placed successfully)', emailError);
            // Even if email fails, the order is placed. Send success response.
            res.status(201).json(createdOrder);
            return;
        }
    }

    // --- 5. Handle Stripe/Credit Card Flow ---
    // If CreditCard is selected, return the created Order ID to the frontend.
    // The frontend will then call the PaymentController to start the Stripe session.
    res.status(201).json(createdOrder);
});

// =================================================================================
// @desc    Check if the logged-in user has purchased a specific product
// @route   GET /api/orders/has-purchased/:productId
// @access  Private
// =================================================================================
const hasUserPurchasedProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    // Find if an order exists for the user where:
    // 1. The order is marked as paid (or delivered, depending on your review policy).
    // 2. The orderItems array contains the specified productId.
    const orderExists = await Order.findOne({
        user: userId,
        isPaid: true, // Only consider orders that are paid
        // Use dot notation to query inside the array of sub-documents
        'orderItems.product': productId,
    });

    // Return a simple JSON object indicating purchase status
    if (orderExists) {
        res.json({ hasPurchased: true });
    } else {
        res.json({ hasPurchased: false });
    }
});
// =================================================================================

// =================================================================================
// @desc    Get orders for the logged-in user
// @route   GET /api/orders/myorders
// @access  Private
// =================================================================================
const getMyOrders = asyncHandler(async (req, res) => {
    const filter = { user: req.user._id };

    if (req.query.isPaid !== undefined) {
        filter.isPaid = req.query.isPaid === 'true';
    }

    const orders = await Order.find(filter);
    res.json(orders);
});

// =================================================================================
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
// =================================================================================
const getOrderById = asyncHandler(async (req, res) => {
    // Populate user details
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

    if (order) {
        // Authorization check: Only owner or admin can view the order
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(403);
            throw new Error('Not authorized to view this order');
        }
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// =================================================================================
// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
// =================================================================================
const getOrders = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;
    const skip = pageSize * (page - 1);

    const filter = {};
    const query = req.query;

    if (query.isPaid !== undefined) {
        filter.isPaid = query.isPaid === 'true';
    }

    if (query.isDelivered !== undefined) {
        filter.isDelivered = query.isDelivered === 'true';
    }

    if (query.user) {
        filter.user = query.user;
    }

    if (query.paymentMethod) {
        filter.paymentMethod = query.paymentMethod;
    }

    if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate) {
            filter.createdAt.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
            filter.createdAt.$lte = new Date(query.endDate);
        }
    }

    let sortOptions = { createdAt: -1 };

    if (query.sortBy === 'oldest') {
        sortOptions = { createdAt: 1 };
    }

    const count = await Order.countDocuments(filter);
    const totalPages = Math.ceil(count / pageSize);

    const orders = await Order.find(filter)
        .populate('user', 'id firstName lastName')
        .sort(sortOptions)
        .limit(pageSize)
        .skip(skip);

    res.json({
        orders,
        page: page,
        pages: totalPages,
        totalOrders: count,
    });
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
    // Populate user details fully for the invoice and email
    const order = await Order.findById(req.params.id).populate('user', 'email firstName lastName');

    if (order) {
        if (order.isPaid) {
            res.status(400);
            throw new Error('Order is already marked as paid');
        }

        // 1. Update Order Status
        order.isPaid = true;
        order.paidAt = Date.now(); // We use paidAt instead of update_time

        // Save payment result details (without update_time)
        if (req.body.paymentResult) {
            order.paymentResult = {
                id: req.body.paymentResult.id || req.body.id,
                status: req.body.paymentResult.status || 'Success',
                // update_time field is explicitly omitted
                email_address: req.body.paymentResult.email_address || order.user.email,
            };
        } else {
            // Fallback details if req.body is minimal
            order.paymentResult = {
                id: req.params.id, // Use Order ID as a fallback for payment ID
                status: 'Success',
                email_address: order.user.email,
            };
        }

        const updatedOrder = await order.save({ validateBeforeSave: false });

        // 2. SEND PAYMENT CONFIRMATION & INVOICE EMAIL

        let attachments = [];
        let emailSubject = `✅ Payment Confirmation & Invoice: #${order._id.toString().substring(18)}`;

        // Generate Invoice PDF
        try {
            const user = order.user;
            const invoiceBuffer = await createInvoicePdf(updatedOrder, user);

            attachments = [
                {
                    filename: `Invoice_${order._id.toString().substring(18)}.pdf`,
                    content: invoiceBuffer,
                    contentType: 'application/pdf',
                }
            ];

        } catch (error) {
            console.error('ERROR: Failed to generate or attach invoice PDF:', error.message);
            emailSubject = `✅ Payment Confirmation: #${order._id.toString().substring(18)}`;
        }

        // Prepare Email Content
        const messageText = `Dear ${order.user.firstName}, Your payment for order #${order._id.toString().substring(18)} was successfully processed. Thank you for your purchase! Please find the attached invoice.`;

        // Send Email (using the positional arguments format from your createOrder function)
        try {
            await sendEmail(order.user.email, emailSubject, messageText, attachments);

        } catch (emailError) {
            console.error(`ERROR: Failed to send payment confirmation email: ${emailError.message}`);
        }

        res.json(updatedOrder);

    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});




// =================================================================================
// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
// =================================================================================
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'email firstName')
        .populate('orderItems.product', 'name');

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save({ validateBeforeSave: false });

        const fullOrderId = order._id.toString();

        const productListHtml = order.orderItems.map(item => `
            <li>
                <strong>${item.product.name}</strong> 
            </li>
        `).join('');

        const emailSubject = `✅ Order Successfully Delivered: #${fullOrderId}`;

        const messageHtml = `
            <p>Dear ${order.user.firstName},</p>
            <p>We are happy to confirm that your order **#${fullOrderId}** has been **successfully delivered**!</p>
            
            <h4 style="margin-top: 20px;">Delivered Items:</h4>
            <ul style="list-style: disc; padding-left: 20px;">
                ${productListHtml}
            </ul>

            <p style="margin-top: 20px;">You can view your complete order details and invoice anytime in your account history.</p>
            <br>
            <p>Regards,<br>Mobile Mania Team</p>
        `;

        try {
            await sendEmail(order.user.email, emailSubject, messageHtml, []);

        } catch (error) {
            console.error(`Error sending delivery email: ${error.message}`);
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});



// =================================================================================
// @desc    Delete order (Admin only, or maybe user before delivery/payment)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
// =================================================================================
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Security check: Only the owner or an admin can delete the order
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('User not authorized to delete this order');
        }

        if (order.isDelivered) {
            res.status(400);
            throw new Error('Cannot delete a delivered order');
        }

        await Order.deleteOne({ _id: order._id });
        res.json({ message: 'Order removed successfully' });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// =================================================================================
// Export all controller functions, including the new one
// =================================================================================
module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getOrders,
    updateOrderToPaid,
    updateOrderToDelivered,
    deleteOrder,
    hasUserPurchasedProduct
};