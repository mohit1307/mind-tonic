const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');

// All admin routes strictly enforce JWT authentication + Administrator role
router.use(auth);
router.use(auth.requireAdmin);

// Dashboard overview matching design metrics
router.get('/overview', adminController.getOverview);

// User management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

// System logs
router.get('/logs', adminController.getLogs);

// Website settings & configuration
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSettings);

module.exports = router;
