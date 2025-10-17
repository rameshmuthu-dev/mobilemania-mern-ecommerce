// backend/routes/analyticsRoutes.js

const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware'); 
const { getDashboardAnalytics } = require('../controllers/analyticsController'); 


router.route('/dashboard').get(protect, admin, getDashboardAnalytics); 


module.exports = router;