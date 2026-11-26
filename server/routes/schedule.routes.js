const express = require('express');
const router = express.Router();

const scheduleController = require('../controllers/schedule.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  generateScheduleSchema,
  updateScheduleSchema,
  updateBlockSchema,
} = require('../validators/schedule.validator');

// All schedule routes require authentication
router.use(auth);

// Missed-task recovery & alternative slot endpoints (must be above /:date)
router.get('/missed/detect', scheduleController.detectMissed);
router.post('/missed/suggest', scheduleController.suggestMissed);
router.post('/missed/apply', scheduleController.applyMissed);

// Generate timetable
router.post('/generate', validate(generateScheduleSchema), scheduleController.generateSchedule);

// Week view
router.get('/week/:startDate', scheduleController.getWeekSchedule);

// Date-specific schedule CRUD
router.get('/:date', scheduleController.getScheduleByDate);
router.put('/:date', validate(updateScheduleSchema), scheduleController.updateSchedule);

// Block level mutations
router.patch('/:date/block/:blockId', validate(updateBlockSchema), scheduleController.updateBlock);
router.delete('/:date/block/:blockId', scheduleController.deleteBlock);

module.exports = router;
