const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const User = require('../models/User'); 
const Review = require('../models/Review'); 
const Product = require('../models/Product'); 


const getDashboardAnalytics = asyncHandler(async (req, res) => {
    
    const [totalStats, salesTrend, topProducts, totalReviewsCount, totalUsersCount, totalProductsCount] = await Promise.all([
        
        // 1. Total Revenue & Orders
        Order.aggregate([
            { $match: { isPaid: true, isDelivered: true } }, 
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, totalOrders: { $sum: 1 } } },
            { $project: { _id: 0, totalRevenue: 1, totalOrders: 1 } }
        ]),

        // 2. Sales Trend
        Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } }, totalSales: { $sum: '$totalPrice' } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 6 } 
        ]),
        
        // 3. Top Products
        Order.aggregate([
            { $match: { isDelivered: true } }, 
            { $unwind: '$orderItems' }, 
            { $group: { _id: '$orderItems.product', totalQuantitySold: { $sum: '$orderItems.qty' } } },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
            { $project: { _id: 0, name: { $arrayElemAt: ['$productDetails.name', 0] }, totalQuantitySold: 1 } }
        ]),
        
        // 4. Total Reviews Count
        Review.countDocuments(),

        // 5. Total Users Count
        User.countDocuments(),

        // 6. Total Products Count
        Product.countDocuments() 
    ]);
    
    res.json({
        totalRevenue: totalStats[0] ? totalStats[0].totalRevenue : 0,
        totalOrders: totalStats[0] ? totalStats[0].totalOrders : 0,
        
        totalReviewsCount, 
        totalUsersCount,
        totalProductsCount, 
        
        salesTrend,
        topProducts
    });
});

module.exports = { getDashboardAnalytics };