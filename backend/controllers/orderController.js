const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User'); 
const Product = require('../models/Product');
const { createInvoicePdf } = require('../services/invoiceService');
const { sendEmail } = require('../services/emailService');

const roundToTwoDecimals = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
};

const createOrder = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error("User not authorized. Please log in to place an order.");
    }

    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error("No order items");
    }

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

    const shippingPriceUnrounded = itemsPriceUnrounded > 10000 ? 0 : 50;
    const taxPriceUnrounded = itemsPriceUnrounded * 0.18;
    const totalPriceUnrounded = itemsPriceUnrounded + shippingPriceUnrounded + taxPriceUnrounded;

    const itemsPrice = roundToTwoDecimals(itemsPriceUnrounded);
    const shippingPrice = roundToTwoDecimals(shippingPriceUnrounded);
    const taxPrice = roundToTwoDecimals(taxPriceUnrounded);
    const totalPrice = roundToTwoDecimals(totalPriceUnrounded);

    let isPaid = false; 
    let paidAt = null;
    let paymentDetails = null;

    if (paymentMethod !== 'Cash on Delivery (COD)' &&
        paymentMethod !== 'CreditCard') {
        res.status(400);
        throw new Error("Invalid payment method selected. Must be 'Cash on Delivery (COD)' or 'CreditCard'.");
    }

    const order = new Order({
        user: req.user._id, 
        orderItems: validatedOrderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        isPaid: isPaid, 
        paidAt: paidAt,
        paymentResult: paymentDetails,
    });

    const createdOrder = await order.save();

    if (paymentMethod === 'Cash on Delivery (COD)') {
        try {
            const pdfBuffer = await createInvoicePdf(createdOrder, req.user);
            const userEmail = req.user.email;
            const subject = `Order Confirmation (COD) #${createdOrder._id}`;
            const emailContent = `Thank you for your COD purchase! Your order (ID: ${createdOrder._id}) has been successfully placed. Payment will be collected upon delivery. Please find the attached invoice.`;

            const attachments = [
                {
                    filename: `Invoice_${createdOrder._id.toString().substring(18)}.pdf`,
                    content: pdfBuffer.toString('base64'), 
                    contentType: 'application/pdf',
                }
            ];

            await sendEmail(userEmail, subject, emailContent, attachments);
            console.log(`COD order confirmation email sent to ${userEmail}`);

            res.status(201).json(createdOrder);
            return; 
        } catch (emailError) {
            console.error('ERROR: Failed to send COD confirmation email. (Order was placed successfully)', emailError);
            res.status(201).json(createdOrder);
            return;
        }
    }

    res.status(201).json(createdOrder);
});

const hasUserPurchasedProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const orderExists = await Order.findOne({
        user: userId,
        isPaid: true, 
        'orderItems.product': productId,
    });

    if (orderExists) {
        res.json({ hasPurchased: true });
    } else {
        res.json({ hasPurchased: false });
    }
});

const getMyOrders = asyncHandler(async (req, res) => {
    const filter = { user: req.user._id };

    if (req.query.isPaid !== undefined) {
        filter.isPaid = req.query.isPaid === 'true';
    }

    const orders = await Order.find(filter);
    res.json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

    if (order) {
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
    const order = await Order.findById(req.params.id).populate('user', 'email firstName lastName');

    if (order) {
        if (order.isPaid) {
            res.status(400);
            throw new Error('Order is already marked as paid');
        }

        order.isPaid = true;
        order.paidAt = Date.now(); 

        if (req.body.paymentResult) {
            order.paymentResult = {
                id: req.body.paymentResult.id || req.body.id,
                status: req.body.paymentResult.status || 'Success',
                email_address: req.body.paymentResult.email_address || order.user.email,
            };
        } else {
            order.paymentResult = {
                id: req.params.id, 
                status: 'Success',
                email_address: order.user.email,
            };
        }

        const updatedOrder = await order.save({ validateBeforeSave: false });

        let attachments = [];
        let emailSubject = `✅ Payment Confirmation & Invoice: #${order._id.toString().substring(18)}`;

        try {
            const user = order.user;
            const invoiceBuffer = await createInvoicePdf(updatedOrder, user);

            attachments = [
                {
                    filename: `Invoice_${order._id.toString().substring(18)}.pdf`,
                    content: invoiceBuffer.toString('base64'),
                    contentType: 'application/pdf',
                }
            ];

        } catch (error) {
            console.error('ERROR: Failed to generate or attach invoice PDF:', error.message);
            emailSubject = `✅ Payment Confirmation: #${order._id.toString().substring(18)}`;
        }

        const messageText = `Dear ${order.user.firstName}, Your payment for order #${order._id.toString().substring(18)} was successfully processed. Thank you for your purchase! Please find the attached invoice.`;

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

const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
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