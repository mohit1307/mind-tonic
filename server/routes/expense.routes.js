const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createExpenseSchema,
  updateExpenseSchema,
} = require('../validators/expense.validator');

router.use(authenticate);

// Specific sub-routes (before :id)
router.get('/stats', expenseController.getStats);
router.post('/from-ocr', expenseController.createFromOCR);

// Standard CRUD
router.post('/', validate(createExpenseSchema), expenseController.create);
router.get('/', expenseController.getAll);
router.get('/:id', expenseController.getById);
router.put('/:id', validate(updateExpenseSchema), expenseController.update);
router.delete('/:id', expenseController.delete);

module.exports = router;
