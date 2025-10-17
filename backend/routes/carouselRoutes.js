const express = require('express');
const router = express.Router();
const {
    createCarousel,
    getCarousels,
    getCarouselById,
    updateCarousel,
    deleteCarousel
} = require('../controllers/carouselController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getCarousels)
    .post(protect, admin, upload.single('image'), createCarousel);

router.route('/:id')
    .get(getCarouselById)
    .put(protect, admin, upload.single('image'), updateCarousel)
    .delete(protect, admin, deleteCarousel);

module.exports = router;