// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const {
    createReview,
    getReviews,
    updateReview,
     getReviewsForAdmin,
    deleteReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');
//   admin
router.route('/admin')
    .get(protect, admin, getReviewsForAdmin); 

router.route('/').post(protect, createReview);
router.route('/').get(getReviews);
router.route('/:id')
    .put(protect, updateReview)
    .delete(protect , deleteReview);

module.exports = router;