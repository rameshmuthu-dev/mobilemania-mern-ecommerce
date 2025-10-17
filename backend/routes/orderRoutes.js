const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    deleteOrder,
    hasUserPurchasedProduct // <-- 1. Import the new controller function
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getOrders);

router.get('/myorders', protect, getMyOrders);

// 2. Add the new route to check if the user has purchased the product
router.get('/has-purchased/:productId', protect, hasUserPurchasedProduct); // <-- FIX

router.route('/:id')
    .get(protect, getOrderById);
router.put('/:id/pay', protect, admin, updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);
router.delete('/:id', protect, deleteOrder);

module.exports = router;