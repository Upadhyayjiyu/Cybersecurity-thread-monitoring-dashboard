const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentLogs, getAlerts } = require('../controllers/dashboardController');
const { adminAuth } = require('../middleware/auth');

router.get('/stats', adminAuth, getDashboardStats);
router.get('/logs', adminAuth, getRecentLogs);
router.get('/alerts', adminAuth, getAlerts);

module.exports = router;
