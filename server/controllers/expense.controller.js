const expenseService = require('../services/expense.service');
const apiResponse = require('../utils/apiResponse');

class ExpenseController {
  async create(req, res, next) {
    try {
      const expense = await expenseService.createExpense(req.user.id, req.body);
      return apiResponse.created(res, { expense }, 'Expense created successfully');
    } catch (error) {
      next(error);
    }
  }

  async createFromOCR(req, res, next) {
    try {
      const { documentId, ...customData } = req.body;
      const expense = await expenseService.createFromOCR(req.user.id, documentId, customData);
      return apiResponse.created(res, { expense }, 'Expense created from OCR receipt');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const expenses = await expenseService.getExpenses(req.user.id, req.query);
      return apiResponse.success(res, { expenses }, 'Expenses retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const expense = await expenseService.getExpenseById(req.user.id, req.params.id);
      return apiResponse.success(res, { expense }, 'Expense retrieved');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const expense = await expenseService.updateExpense(req.user.id, req.params.id, req.body);
      return apiResponse.success(res, { expense }, 'Expense updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await expenseService.deleteExpense(req.user.id, req.params.id);
      return apiResponse.success(res, result, 'Expense deleted');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await expenseService.getExpenseStats(req.user.id, req.query);
      return apiResponse.success(res, { stats }, 'Expense statistics retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExpenseController();
