const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/overview', analyticsController.getOverview);

module.exports = router;
