// controllers/reviewController.js
const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create a new review for a product
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { productId, rating, comment } = req.body;
    const { _id: userId, name: userName } = req.user;

    // 🚨 FIX 1: Check if the user already reviewed this product (One Review Per User)
    const alreadyReviewed = await Review.findOne({ product: productId, user: userId });

    if (alreadyReviewed) {
        res.status(400); // 400 Bad Request
        throw new Error('You have already submitted a review for this product');
    }

    const review = await Review.create({
        product: productId,
        user: userId,
        rating,
        comment,
    });

    // Update Product Details
    const product = await Product.findById(productId);
    if (product) {
        const reviews = await Review.find({ product: productId });
        const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);

        // Update product rating and review count
        product.rating = (totalRating / reviews.length).toFixed(1);
        product.numReviews = reviews.length;
        await product.save();
    }

    // 🚨 FIX 2: Populate the user details before sending the response (To Show Review Immediately)
    const populatedReview = await review.populate('user', 'name');

    res.status(201).json(populatedReview); // Send the full populated review object
});

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
    // Note: In most setups, the route parameter will be /api/reviews?productId=... or /api/products/:productId/reviews
    // Assuming you are using req.query.productId if the route is /api/reviews
    // If your route is /api/reviews/:productId, change req.params.productId to req.params.id (or whichever parameter name you use)
    const productId = req.query.productId || req.params.productId; // Adjusted for flexibility
    const reviews = await Review.find({ product: productId }).populate('user', 'name');
    res.json(reviews);
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (review) {
        if (review.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized to update this review');
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        const updatedReview = await review.save();

        // Recalculate product rating after update
        const product = await Product.findById(review.product);
        if (product) {
            const reviews = await Review.find({ product: review.product });
            const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
            product.rating = (totalRating / reviews.length).toFixed(1);
            await product.save();
        }

        res.json(updatedReview);
    } else {
        res.status(404);
        throw new Error('Review not found');
    }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (review) {
        if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('User not authorized to delete this review');
        }

        const productId = review.product; // Get product ID before deleting review

        await review.deleteOne();

        // 🚨 FIX 3: Recalculate and update product rating after deletion
        const product = await Product.findById(productId);
        if (product) {
            const reviews = await Review.find({ product: productId });
            const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);

            // Update product rating and review count
            product.rating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
            product.numReviews = reviews.length;
            await product.save();
        }
        // END FIX 3

        res.json({ message: 'Review removed' });
    } else {
        res.status(404);
        throw new Error('Review not found');
    }
});


// @desc    Get all reviews (for Admin Management)
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getReviewsForAdmin = asyncHandler(async (req, res) => {
    try {
        // Find all reviews and populate the product and user fields
        const reviews = await Review.find({})
            .populate('product', 'name')
            .populate('user', 'name');

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: Could not fetch all reviews.' });
    }
});

module.exports = {
    createReview,
    getReviews,
    updateReview,
    deleteReview,
    getReviewsForAdmin
};