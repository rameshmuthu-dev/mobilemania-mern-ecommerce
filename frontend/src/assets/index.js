// ======================= Package Imports =======================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Stripe = require('stripe');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const pdf = require('html-pdf');

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ======================= Express App and Middleware =======================
const app = express();

app.post('/api/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
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

app.use(express.json());
app.use(cors());

// ======================= Cloudinary Configuration =======================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mobile-mania-products',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req, file) => `${Date.now()}-${file.originalname}`,
    },
});

const upload = multer({ storage: storage });

// ======================= Database Connection =======================
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

// ======================= Mongoose Schemas (Models) =======================
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    isVerified: { type: Boolean, required: true, default: false },
    isAdmin: { type: Boolean, required: true, default: false },
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        qty: { type: Number, required: true }
    }],
    wishlist: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    }],
    otp: String,
    otpExpiry: Date,
    otpLastSentAt: Date
});
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    countInStock: { type: Number, required: true, default: 0 },
    specs: {
        processor: { type: String },
        ram: { type: String },
        storage: { type: String },
        display: { type: String },
        camera: { type: String },
        battery: { type: String },
        graphicsCard: { type: String },
        os: { type: String },
        color: { type: String },
    },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [{
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    }],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true, default: 0.0 },
    paymentMethod: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);

// ======================= JWT Authentication & Admin Middleware =======================
const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user || !req.user.isVerified) {
                res.status(401);
                throw new Error('Not authorized, user not verified');
            }
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

// ======================= Email Service for OTP =======================
const sendEmail = async (email, subject, text, attachments = []) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });
    const mailOptions = {
        from: `No-reply Mobile Mania <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: text,
        attachments: attachments,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email could not be sent:', error);
    }
};

// ======================= Invoice Generation Functions =======================
const generateInvoiceHtml = (order, user) => {
    const itemsTable = order.orderItems.map(item => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.qty}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${(item.qty * item.price).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #333;">INVOICE</h1>
                <p style="font-size: 14px; color: #555;">Invoice #: ${order._id}</p>
                <p style="font-size: 14px; color: #555;">Date: ${new Date(order.paidAt).toLocaleDateString()}</p>
                <h2 style="font-size: 24px; color: #007BFF; margin-top: 20px;">Mobile Mania</h2>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div style="width: 48%;">
                    <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Billed To:</h2>
                    <p style="font-size: 14px; line-height: 1.5;">${user.firstName} ${user.lastName || ''}</p>
                    <p style="font-size: 14px; line-height: 1.5;">${user.email}</p>
                </div>
                <div style="width: 48%;">
                    <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Shipped To:</h2>
                    <p style="font-size: 14px; line-height: 1.5;">${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
                    <p style="font-size: 14px; line-height: 1.5;">${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>
                </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Quantity</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Unit Price</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsTable}
                </tbody>
            </table>
            <div style="text-align: right; font-size: 16px;">
                <p style="font-weight: bold; padding: 5px;">Subtotal: ₹${(order.totalPrice * 0.9).toFixed(2)}</p>
                <p style="font-weight: bold; padding: 5px;">Taxes: ₹${(order.totalPrice * 0.1).toFixed(2)}</p>
                <p style="font-weight: bold; padding: 5px; border-top: 1px solid #ddd;">Grand Total: ₹${order.totalPrice.toFixed(2)}</p>
            </div>
        </div>
    `;
};

const createInvoicePdf = (order, user) => {
    return new Promise((resolve, reject) => {
        const html = generateInvoiceHtml(order, user);
        pdf.create(html, { format: 'A4' }).toBuffer((err, buffer) => {
            if (err) return reject(err);
            resolve(buffer);
        });
    });
};

// ======================= Public Routes =======================
app.get('/api/products', asyncHandler(async (req, res) => {
    const { category, subcategory } = req.query;
    let filter = {};
    if (category) {
        filter.category = category;
    }
    if (subcategory) {
        filter.subcategory = subcategory;
    }
    const products = await Product.find(filter);
    res.json(products);
}));
app.get('/api/products/:id', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

// ======================= User Auth & Features Routes =======================
app.post('/api/users/request-otp', asyncHandler(async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists && userExists.isVerified) {
        res.status(400);
        throw new Error('User already exists with this email address');
    }
    if (userExists && userExists.otpLastSentAt) {
        const timeElapsed = (Date.now() - userExists.otpLastSentAt) / 1000;
        if (timeElapsed < 30) {
            res.status(429);
            throw new Error('Please wait 30 seconds before requesting a new OTP.');
        }
    }
    let user;
    if (userExists) {
        user = userExists;
    } else {
        user = await User.create({ firstName, lastName, email });
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = Date.now() + 300000;
    user.otpLastSentAt = Date.now();
    await user.save();
    const subject = 'Mobile Mania - Verify Your Email Address';
    const text = `Hi ${user.firstName},\n\nYour OTP for email verification is: ${otp}\n\nThis OTP is valid for 1 minute.`;
    await sendEmail(user.email, subject, text);
    res.status(200).json({ success: true, message: 'OTP sent to your email' });
}));
app.post('/api/users/register', asyncHandler(async (req, res) => {
    const { email, password, otp, firstName, lastName } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found. Please request an OTP first.');
    }
    if (user.isVerified) {
        res.status(400);
        throw new Error('Email is already verified. Please login.');
    }
    if (user.otpExpiry < Date.now()) {
        res.status(400);
        throw new Error('OTP has expired. Please request a new OTP.');
    }
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
        res.status(400);
        throw new Error('Invalid OTP');
    }
    user.password = password;
    user.isVerified = true;
    user.firstName = firstName;
    user.lastName = lastName;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    const subject = 'Welcome to Mobile Mania!';
    const text = `Hi ${user.firstName},\n\nThanks for registering with us. We are excited to have you on board!`;
    await sendEmail(user.email, subject, text);
    res.status(201).json({
        _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
    });
}));
app.post('/api/users/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            res.status(401);
            throw new Error('Account not verified. Please verify your email with the OTP.');
        }
        res.json({
            _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, isAdmin: user.isAdmin,
            isVerified: user.isVerified,
            token: jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
}));
app.get('/api/users/profile', protect, asyncHandler(async (req, res) => {
    res.json({
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
        isVerified: req.user.isVerified
    });
}));
app.post('/api/users/cart', protect, asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
        const itemExists = user.cart.find(item => item.product.toString() === productId);
        if (itemExists) {
            itemExists.qty = qty;
        } else {
            user.cart.push({ product: productId, qty });
        }
        await user.save();
        res.status(201).json(user.cart);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));
app.get('/api/users/cart', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('cart.product', 'name price images');
    if (user) {
        res.json(user.cart);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));
app.post('/api/orders', protect, asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, totalPrice, paymentMethod } = req.body;
    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            totalPrice,
            paymentMethod,
            isPaid: false,
        });
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
}));
app.get('/api/orders/myorders', protect, asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
}));
app.delete('/api/orders/:id', protect, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.user.toString() !== req.user._id.toString()) {
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
}));
app.post('/api/users/wishlist', protect, asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
            res.status(201).json(user.wishlist);
        } else {
            res.status(400);
            throw new Error('Product already in wishlist');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));
app.get('/api/users/wishlist', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist.product');
    if (user) {
        res.json(user.wishlist);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));
app.delete('/api/users/wishlist/:id', protect, asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const user = await User.findById(req.user._id);

    if (user) {
        user.wishlist = user.wishlist.filter(item => item.toString() !== productId);
        await user.save();
        res.json({ message: 'Product removed from wishlist' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));

// ======================= Admin Features =======================
app.post('/api/products', protect, admin, upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'name', maxCount: 1 },
    { name: 'brand', maxCount: 1 },
    { name: 'description', maxCount: 1 },
    { name: 'price', maxCount: 1 },
    { name: 'countInStock', maxCount: 1 },
    { name: 'category', maxCount: 1 },
    { name: 'subcategory', maxCount: 1 },
    { name: 'specs', maxCount: 1 }
]), asyncHandler(async (req, res) => {
    const { name, brand, description, price, category, subcategory, countInStock, specs } = req.body;

    if (!req.files || !req.files.images || req.files.images.length === 0) {
        res.status(400);
        throw new Error("No image files were uploaded.");
    }
    
    const images = req.files.images.map(file => file.path);
    
    let parsedSpecs = {};
    if (specs) {
        try {
            parsedSpecs = JSON.parse(specs);
        } catch (jsonError) {
            res.status(400);
            throw new Error("Invalid specs data format. Please provide a valid JSON string.");
        }
    }
    
    const product = new Product({
        name, brand, description, price, images, category, subcategory, countInStock,
        specs: parsedSpecs,
        user: req.user._id
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
}));
app.put('/api/products/:id/image-upload', protect, admin, upload.fields([
    { name: 'images', maxCount: 5 }
]), asyncHandler(async (req, res) => {
    const productId = req.params.id;

    if (!req.files || !req.files.images || req.files.images.length === 0) {
        res.status(400);
        throw new Error('No image files were uploaded.');
    }

    const product = await Product.findById(productId);

    if (product) {
        const newImages = req.files.images.map(file => file.path);
        product.images = newImages;

        const updatedProduct = await product.save();

        res.json({
            message: 'Images updated successfully',
            product: updatedProduct
        });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));
app.get('/api/orders', protect, admin, asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id firstName lastName');
    res.json(orders);
}));
app.put('/api/orders/:id/deliver', protect, admin, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
}));
app.delete('/api/products/:id', protect, admin, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));
app.put('/api/products/:id', protect, admin, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        const { name, brand, description, price, images, countInStock, specs } = req.body;
        product.name = name || product.name;
        product.brand = brand || product.brand;
        product.description = description || product.description;
        product.price = price || product.price;
        product.images = images || product.images;
        product.countInStock = countInStock || product.countInStock;
        product.specs = specs || product.specs;
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));
app.get('/api/users', protect, admin, asyncHandler(async (req, res) => {
    const users = await User.find({}).select('firstName lastName email isAdmin isVerified');
    res.json(users);
}));
app.put('/api/users/:id', protect, admin, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.isAdmin = req.body.isAdmin;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));

// ======================= Password Reset (OTP) Routes =======================
app.post('/api/users/forgotpassword', asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found with that email address');
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = Date.now() + 600000;
    await user.save();
    const message = `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.`;
    const forgotPasswordSubject = 'Mobile Mania - Password Reset OTP';
    await sendEmail(user.email, forgotPasswordSubject, message);
    res.status(200).json({ success: true, message: 'Password reset OTP sent to your email' });
}));
app.post('/api/users/resetpassword', asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.otpExpiry < Date.now()) {
        res.status(400);
        throw new Error('OTP has expired');
    }
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
        res.status(400);
        throw new Error('Invalid OTP');
    }
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
}));

// ======================= Stripe Payment Routes =======================
app.post('/api/create-checkout-session', protect, asyncHandler(async (req, res) => {
    const { orderItems, orderId } = req.body;
    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items to checkout');
    }

    const lineItems = await Promise.all(orderItems.map(async item => {
        const productDetails = await Product.findById(item.product);
        if (!productDetails) {
            throw new Error(`Product with ID ${item.product} not found`);
        }
        return {
            price_data: {
                currency: 'inr',
                product_data: {
                    name: productDetails.name,
                    description: productDetails.description,
                    images: productDetails.images, // Stripe-ல் தயாரிப்பு படங்களை சேர்க்க
                },
                unit_amount: item.price * 100,
            },
            quantity: item.qty,
        };
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        metadata: {
            orderId: orderId,
        }
    });

    res.json({
        id: session.id,
        publishableKey: process.env.STRIPE_PUBLISHable_KEY
    });
}));

// ======================= Custom Error Handling Middleware for Multer =======================
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("Multer error:", err.message);
        return res.status(400).json({
            message: `Multer Error: ${err.message}`,
            field: err.field || null
        });
    }
    next(err);
});

// ======================= Default Error Handler =======================
app.use(asyncHandler((req, res, next) => {
    res.status(404);
    throw new Error(`Not Found - ${req.originalUrl}`);
}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// ======================= Server Port =======================
const PORT = process.env.PORT || 8081;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
