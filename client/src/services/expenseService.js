import api from './api';

const expenseService = {
  async createExpense(data) {
    const res = await api.post('/expenses', data);
    return res.data?.expense || res.expense || res.data || res;
  },

  async createFromOCR(data) {
    const res = await api.post('/expenses/from-ocr', data);
    return res.data?.expense || res.expense || res.data || res;
  },

  async getExpenses(params = {}) {
    const res = await api.get('/expenses', { params });
    return res.data?.expenses || res.expenses || (Array.isArray(res.data) ? res.data : []) || [];
  },

  async getExpenseById(id) {
    const res = await api.get(`/expenses/${id}`);
    return res.data?.expense || res.expense || res.data || res;
  },

  async updateExpense(id, data) {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data?.expense || res.expense || res.data || res;
  },

  async deleteExpense(id) {
    const res = await api.delete(`/expenses/${id}`);
    return res.data || res;
  },

  async getStats(params = {}) {
    const res = await api.get('/expenses/stats', { params });
    return res.data?.stats || res.stats || res.data || {
      totalSpentThisMonth: 0,
      totalPendingFees: 0,
      collegeFeesSummary: { totalPaid: 0, totalPending: 0 },
      categoryBreakdown: [],
      recentExpenses: [],
    };
  },
};

export default expenseService;
