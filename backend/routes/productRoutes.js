const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
     getSimilarProducts,    
    getFilterOptions, 
    createProduct,
    updateProductImages,
    updateProduct,
    deleteProduct,
    getProductIdsAndNames
} = require('../controllers/productController');


const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


router.route('/ids').get(protect, admin, getProductIdsAndNames);
router.route('/filters').get(getFilterOptions); 



router.route('/')
    .get(getProducts)
    .post(protect, admin, upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'name', maxCount: 1 },
        { name: 'brand', maxCount: 1 },
        { name: 'description', maxCount: 1 },
        { name: 'price', maxCount: 1 },
        { name: 'countInStock', maxCount: 1 },
        { name: 'category', maxCount: 1 },
        { name: 'subcategory', maxCount: 1 },
        { name: 'specs', maxCount: 1 }
    ]), createProduct);

router.route('/:id')
    .get(getProductById)

    .put(
        protect, 
        admin, 
        upload.fields([
            { name: 'newImages', maxCount: 5 }, 
            { name: 'currentImages', maxCount: 1 },
            { name: 'specs', maxCount: 1 },
            { name: 'name', maxCount: 1 } 
        ]),
        updateProduct
    )

    .delete(protect, admin, deleteProduct);

router.put('/:id/image-upload', protect, admin, upload.fields([
    { name: 'images', maxCount: 5 }
]), updateProductImages);





router.route('/:id/similar').get(getSimilarProducts);


module.exports = router;