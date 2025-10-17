// src/controllers/productController.js

const asyncHandler = require('express-async-handler');
const Product = require('../models/Product'); // Assuming this path is correct

// --- HELPER FUNCTION: Helper to convert comma-separated string to array ---
const getArrayFromQuery = (queryValue) => {
    return queryValue ? queryValue.split(',').filter(v => v.trim() !== '') : [];
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    // --- PAGINATION LOGIC ---
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // ------------------------

    const { price, sort, search } = req.query;
    let filter = {};
    let sortOptions = {};

    // --- FILTER LOGIC (UPDATED FOR MULTI-SELECT) ---

    // 🚀 UPDATED: Brand Filter (Supports multi-select using $in)
    const brandArray = getArrayFromQuery(req.query.brand);
    if (brandArray.length > 0) {
        filter.brand = { $in: brandArray };
    }
    
    // 🚀 UPDATED: Category Filter (Supports multi-select using $in)
    const categoryArray = getArrayFromQuery(req.query.category);
    if (categoryArray.length > 0) {
        filter.category = { $in: categoryArray };
    }
    
    // Subcategory Filter (Remains single-select or array based on schema)
    const subcategoryArray = getArrayFromQuery(req.query.subcategory);
    if (subcategoryArray.length > 0) {
         filter.subcategory = { $in: subcategoryArray };
    }
    
    if (search) filter.name = { $regex: search, $options: 'i' };

    // Price Filter Logic
    if (price) {
        const [price_gte, price_lte] = price.split('-'); 
        filter.price = {};
        
        if (price_gte) {
            filter.price.$gte = parseInt(price_gte);
        }
        
        if (price_lte && price_lte !== 'max') {
            filter.price.$lte = parseInt(price_lte);
        }
        // If price is only set, but not $gte or $lte (e.g., if price is empty string), remove the filter.
        if (Object.keys(filter.price).length === 0) {
             delete filter.price;
        }
    }
    
    // 🚀 UPDATED: Specs Filter Logic (Supports multi-select for each spec)
    // Front-end should send specs as part of the main query object (e.g., ?specs[ram]=8GB,12GB&specs[color]=Red)
    if (req.query.specs) {
        for (const key in req.query.specs) {
            if (Object.prototype.hasOwnProperty.call(req.query.specs, key)) {
                const specValuesArray = getArrayFromQuery(req.query.specs[key]);
                if (specValuesArray.length > 0) {
                    // Use $in for multi-select functionality on specs
                    filter[`specs.${key}`] = { $in: specValuesArray };
                }
            }
        }
    }

    // --- SORTING LOGIC ---
    if (sort) {
        switch (sort) {
            case 'latest': sortOptions.createdAt = -1; break; // Use 'latest' to match frontend slice
            case 'price_asc': sortOptions.price = 1; break;
            case 'price_desc': sortOptions.price = -1; break;
            case 'rating_desc': sortOptions.rating = -1; break; // Added based on typical use
            case 'a-z': sortOptions.name = 1; break;
            case 'z-a': sortOptions.name = -1; break;
            default: sortOptions.createdAt = -1; break;
        }
    } else {
        sortOptions.createdAt = -1;
    }

    // --- DATABASE EXECUTION ---
    const totalCount = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const products = await Product.find(filter)
        .sort(sortOptions)
        .limit(limit)
        .skip(skip);
    
    res.json({
        success: true,
        page: page,
        limit: limit,
        totalPages: totalPages,
        totalProducts: totalCount,
        products: products,
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    // Assuming product schema uses 'reviews.user' for population, if applicable
    const product = await Product.findById(req.params.id); 
    
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get similar products
// @route   GET /api/products/:id/similar
// @access  Public
const getSimilarProducts = asyncHandler(async (req, res) => {
    
    const productId = req.params.id;
    const limit = parseInt(req.query.limit) || 4; 

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
        return res.status(404).json({ message: 'Current product not found' });
    }
    const brandRegex = new RegExp(`^${currentProduct.brand}$`, 'i'); 

    const filter = {
        _id: { $ne: productId }, 
        $or: [
            { category: currentProduct.category }, 
            { brand: { $regex: brandRegex } }      
        ]
    };

    const similarProducts = await Product.find(filter)
        .limit(limit) 
        .select('name price images'); 

    res.status(200).json({
        success: true,
        products: similarProducts,
    });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
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
});

// @desc    Update product images
// @route   PUT /api/products/:id/image-upload
// @access  Private/Admin
const updateProductImages = asyncHandler(async (req, res) => {
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
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        const { name, brand, description, price, countInStock, specs, currentImages } = req.body;
        
        let parsedSpecs = {};
        if (specs) {
            try {
                parsedSpecs = JSON.parse(specs);
            } catch (jsonError) {
                res.status(400);
                throw new Error("Invalid specs data format. Please provide a valid JSON string.");
            }
        }

        let existingImageUrls = [];
        if (currentImages) {
            try {
                existingImageUrls = JSON.parse(currentImages);
            } catch (jsonError) {
                res.status(400);
                throw new Error("Invalid currentImages data format.");
            }
        }
        
        let newImagePaths = [];
        if (req.files && req.files.newImages) {
            newImagePaths = req.files.newImages.map(file => file.path);
        }
        
        const finalImages = [...existingImageUrls, ...newImagePaths];

        product.name = name || product.name;
        product.brand = brand || product.brand;
        product.description = description || product.description;
        product.price = price || product.price;
        product.countInStock = countInStock || product.countInStock;

        
        product.user = req.user._id; 

        product.specs = parsedSpecs; 
        product.images = finalImages; 

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get all unique filter options
// @route   GET /api/products/filter-options
// @access  Public
const getFilterOptions = asyncHandler(async (req, res) => {
    
    const options = await Product.aggregate([
        // 🚀 CRITICAL FIX: Add $match to filter out non-numeric prices BEFORE aggregation
        {
            $match: {
                price: { $exists: true, $type: "number", $gte: 0 } 
            }
        },
        {
            $group: {
                _id: null,
                categories: { $addToSet: { $toLower: '$category' } },
                brands: { $addToSet: '$brand' },
                // Gathering ALL specification options based on your schema
                processorOptions: { $addToSet: '$specs.processor' }, 
                ramOptions: { $addToSet: '$specs.ram' }, 
                storageOptions: { $addToSet: '$specs.storage' },
                displayOptions: { $addToSet: '$specs.display' },
                cameraOptions: { $addToSet: '$specs.camera' },
                batteryOptions: { $addToSet: '$specs.battery' },
                graphicsCardOptions: { $addToSet: '$specs.graphicsCard' },
                osOptions: { $addToSet: '$specs.os' },
                colorOptions: { $addToSet: '$specs.color' },
                // Finding the overall maximum price
                maxPrice: { $max: "$price" } 
            }
        },
        {
            $project: {
                _id: 0, 
                // Projecting and filtering out null/empty values from all spec arrays
                categories: { $filter: { input: '$categories', as: 'cat', cond: { $ne: ['$$cat', null] } } },
                brands: { $filter: { input: '$brands', as: 'b', cond: { $ne: ['$$b', null] } } },
                
                processorOptions: { $filter: { input: '$processorOptions', as: 'p', cond: { $ne: ['$$p', null] } } },
                ramOptions: { $filter: { input: '$ramOptions', as: 'r', cond: { $ne: ['$$r', null] } } },
                storageOptions: { $filter: { input: '$storageOptions', as: 's', cond: { $ne: ['$$s', null] } } },
                displayOptions: { $filter: { input: '$displayOptions', as: 'd', cond: { $ne: ['$$d', null] } } },
                cameraOptions: { $filter: { input: '$cameraOptions', as: 'cam', cond: { $ne: ['$$cam', null] } } },
                batteryOptions: { $filter: { input: '$batteryOptions', as: 'bat', cond: { $ne: ['$$bat', null] } } },
                graphicsCardOptions: { $filter: { input: '$graphicsCardOptions', as: 'g', cond: { $ne: ['$$g', null] } } },
                osOptions: { $filter: { input: '$osOptions', as: 'o', cond: { $ne: ['$$o', null] } } },
                colorOptions: { $filter: { input: '$colorOptions', as: 'c', cond: { $ne: ['$$c', null] } } },
                maxPrice: 1
            }
        },
    ]);

    const result = options.length > 0 ? options[0] : {};
    
    // Final cleanup and sorting before sending to frontend
    const sortedResult = {
        categories: result.categories ? result.categories.filter(Boolean).sort() : [],
        brands: result.brands ? result.brands.filter(Boolean).sort() : [],
        
        processorOptions: result.processorOptions ? result.processorOptions.filter(Boolean).sort() : [],
        ramOptions: result.ramOptions ? result.ramOptions.filter(Boolean).sort() : [],
        storageOptions: result.storageOptions ? result.storageOptions.filter(Boolean).sort() : [],
        displayOptions: result.displayOptions ? result.displayOptions.filter(Boolean).sort() : [],
        cameraOptions: result.cameraOptions ? result.cameraOptions.filter(Boolean).sort() : [],
        batteryOptions: result.batteryOptions ? result.batteryOptions.filter(Boolean).sort() : [],
        graphicsCardOptions: result.graphicsCardOptions ? result.graphicsCardOptions.filter(Boolean).sort() : [],
        osOptions: result.osOptions ? result.osOptions.filter(Boolean).sort() : [],
        colorOptions: result.colorOptions ? result.colorOptions.filter(Boolean).sort() : [],
        
        maxPrice: result.maxPrice || 0
    };
    
    res.json(sortedResult);
});

// @desc    Get product ID and name for selection (Admin Utility)
// @route   GET /api/products/ids
// @access  Private/Admin
const getProductIdsAndNames = asyncHandler(async (req, res) => {
    
    const products = await Product.find({}).select('_id name'); 
    res.json(products);
});

module.exports = {
    getProducts,
    getProductById,
    getSimilarProducts,
    createProduct,
    updateProductImages,
    updateProduct,
    deleteProduct,
    getFilterOptions,
    getProductIdsAndNames
};