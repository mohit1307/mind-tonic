const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  taskQuerySchema,
} = require('../validators/task.validator');

// All task routes require authentication
router.use(auth);

// Task stats & specialized filters
router.get('/stats', taskController.getStats);
router.get('/overdue', taskController.getOverdue);
router.get('/upcoming', taskController.getUpcoming);

// Task CRUD
router.get('/', validate(taskQuerySchema, 'query'), taskController.getTasks);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Quick status mutations
router.patch('/:id/complete', taskController.toggleComplete);
router.patch('/:id/status', validate(updateStatusSchema), taskController.updateStatus);

module.exports = router;
