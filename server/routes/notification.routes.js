const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', notificationController.getAll);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.delete('/clear-all', notificationController.clearAll);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.delete);

module.exports = router;
