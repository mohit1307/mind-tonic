import api from './api';

const expenseService = {
  async createExpense(data) {
    const res = await api.post('/expenses', data);
    return res.data.data.expense;
  },

  async createFromOCR(data) {
    const res = await api.post('/expenses/from-ocr', data);
    return res.data.data.expense;
  },

  async getExpenses(params = {}) {
    const res = await api.get('/expenses', { params });
    return res.data.data.expenses;
  },

  async getExpenseById(id) {
    const res = await api.get(`/expenses/${id}`);
    return res.data.data.expense;
  },

  async updateExpense(id, data) {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data.data.expense;
  },

  async deleteExpense(id) {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },

  async getStats(params = {}) {
    const res = await api.get('/expenses/stats', { params });
    return res.data.data.stats;
  },
};

export default expenseService;
