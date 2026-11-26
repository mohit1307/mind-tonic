const express = require('express');
const router = express.Router();

const habitController = require('../controllers/habit.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createHabitSchema,
  updateHabitSchema,
  toggleLogSchema,
} = require('../validators/habit.validator');

// All habit routes require authentication
router.use(auth);

// Stats & analytics
router.get('/stats', habitController.getStats);

// Habit CRUD
router.get('/', habitController.getHabits);
router.post('/', validate(createHabitSchema), habitController.createHabit);
router.get('/:id', habitController.getHabitById);
router.put('/:id', validate(updateHabitSchema), habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);

// Log & toggle completion
router.post('/:id/toggle', validate(toggleLogSchema), habitController.toggleLog);

module.exports = router;
