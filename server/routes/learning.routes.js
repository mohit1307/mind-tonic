const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learning.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createSubjectSchema,
  updateSubjectSchema,
  addTopicSchema,
  updateTopicSchema,
  reviewTopicSchema,
  logSessionSchema,
} = require('../validators/learning.validator');

// All learning routes require JWT authentication
router.use(authenticate);

// ── Specific sub-routes (before :id) ──
router.get('/reviews/due', learningController.getDueReviews);
router.get('/stats', learningController.getStats);
router.post('/sessions', validate(logSessionSchema), learningController.logSession);
router.get('/sessions', learningController.getSessions);

// ── Subjects CRUD ──
router.get('/subjects', learningController.getSubjects);
router.post('/subjects', validate(createSubjectSchema), learningController.createSubject);
router.get('/subjects/:id', learningController.getSubjectById);
router.put('/subjects/:id', validate(updateSubjectSchema), learningController.updateSubject);
router.delete('/subjects/:id', learningController.deleteSubject);

// ── Topics within a Subject ──
router.post('/subjects/:id/topics', validate(addTopicSchema), learningController.addTopic);
router.put('/subjects/:id/topics/:topicId', validate(updateTopicSchema), learningController.updateTopic);
router.delete('/subjects/:id/topics/:topicId', learningController.deleteTopic);

// ── Active Recall Review with SM-2 ──
router.post(
  '/subjects/:id/topics/:topicId/review',
  validate(reviewTopicSchema),
  learningController.reviewTopic
);

module.exports = router;
