const express = require('express');
const router = express.Router();

const aiController = require('../controllers/ai.controller');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// All AI endpoints require authentication
router.use(auth);

// Chat & Action confirmation
router.post('/chat', aiLimiter, aiController.chat);
router.post('/actions/:actionId/confirm', aiController.confirmAction);
router.post('/actions/:actionId/reject', aiController.rejectAction);

// Conversation management
router.get('/conversations', aiController.getConversations);
router.get('/conversations/:id', aiController.getConversation);
router.delete('/conversations/:id', aiController.deleteConversation);

module.exports = router;
