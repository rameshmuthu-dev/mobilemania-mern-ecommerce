// ======================= Package Imports =======================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

// ======================= Database Connection =======================
const connectDB = require('./config/db');
connectDB();

// ======================= Import Routes =======================
const webhookRoutes = require('./routes/webhookRoutes'); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const carouselRoutes = require('./routes/carouselRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes');

// ======================= Import Middleware =======================
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// ======================= Express App Setup =======================
const app = express();

// ======================= STRIPE WEBHOOK - MUST COME FIRST =======================
app.use('/api', webhookRoutes); 


// ======================= Regular Middleware =======================
app.use(express.json());
app.use(cors());

// ======================= Regular Routes =======================
app.use('/api/users', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/carousels', carouselRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist' , wishlistRoutes)
app.use('/api/admin', analyticsRoutes);

// ======================= Error Handling =======================
app.use(notFound);
app.use(errorHandler);

// ======================= Server Port =======================
const PORT = process.env.PORT || 8081;

app.listen(PORT, console.log(`Server running on port ${PORT}`));

module.exports = app;