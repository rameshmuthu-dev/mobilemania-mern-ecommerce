const asyncHandler = require('express-async-handler');
const Carousel = require('../models/Carousel');
const cloudinary = require('cloudinary').v2;

// @desc    Create carousel item
// @route   POST /api/carousels
// @access  Private/Admin
const createCarousel = asyncHandler(async (req, res) => {
    const { title, subtitle, productId } = req.body;

    if (!req.file) {
        res.status(400);
        throw new Error('No image file was uploaded for the carousel.');
    }

    const image = req.file.path;

    const newCarousel = new Carousel({
        image,
        title,
        subtitle,
        productId
    });

    const createdCarousel = await newCarousel.save();
    res.status(201).json(createdCarousel);
});

// @desc    Get all carousels
// @route   GET /api/carousels
// @access  Public
const getCarousels = asyncHandler(async (req, res) => {
    // Populate the product details to display the linked product name on the list page
    const carousels = await Carousel.find({}).populate('productId', 'name slug'); 
    res.json(carousels);
});

// @desc    Get single carousel item by ID
// @route   GET /api/carousels/:id
// @access  Public (Used by Admin Edit Page)
const getCarouselById = asyncHandler(async (req, res) => {
    // Populate the product details for displaying/setting the form data
    const carousel = await Carousel.findById(req.params.id).populate('productId', 'name slug');

    if (carousel) {
        res.json(carousel);
    } else {
        res.status(404);
        throw new Error('Carousel item not found');
    }
});


// @desc    Update a carousel item
// @route   PUT /api/carousels/:id
// @access  Private/Admin
const updateCarousel = asyncHandler(async (req, res) => {
    const { title, subtitle, productId } = req.body;

    const carousel = await Carousel.findById(req.params.id);

    if (carousel) {
        // Image Update Handling: If a new file is uploaded
        if (req.file) {
            // Delete old image from Cloudinary
            // Assumes publicId is the part before the extension in the path
            const publicId = carousel.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
            
            // Set new image path
            carousel.image = req.file.path;
        }

        // Update fields
        carousel.title = title || carousel.title;
        carousel.subtitle = subtitle || carousel.subtitle;
        carousel.productId = productId || carousel.productId;

        const updatedCarousel = await carousel.save();
        res.json(updatedCarousel);

    } else {
        res.status(404);
        throw new Error('Carousel not found');
    }
});


// @desc    Delete carousel
// @route   DELETE /api/carousels/:id
// @access  Private/Admin
const deleteCarousel = asyncHandler(async (req, res) => {
    const carousel = await Carousel.findById(req.params.id);

    if (carousel) {
        // Delete image from Cloudinary
        const publicId = carousel.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);

        await Carousel.deleteOne({ _id: carousel._id });
        res.json({ message: 'Carousel removed' });
    } else {
        res.status(404);
        throw new Error('Carousel not found');
    }
});

module.exports = {
    createCarousel,
    getCarousels,
    getCarouselById, 
    updateCarousel, 
    deleteCarousel
};