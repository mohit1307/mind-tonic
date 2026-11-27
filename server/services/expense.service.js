const { supabaseDb } = require('../db/supabaseDb');
const ApiError = require('../utils/apiError');
const { normalizeDate } = require('../utils/timeUtils');

function mapExpenseToApi(e, doc = null) {
  if (!e) return null;
  return {
    _id: e.id,
    id: e.id,
    userId: e.user_id,
    title: e.title,
    amount: Number(e.amount),
    category: e.category || 'other',
    paymentMethod: e.payment_method || 'upi',
    date: e.date,
    isCollegeFee: Boolean(e.is_college_fee),
    feeDetails: e.fee_details || {},
    status: e.status || 'paid',
    dueDate: e.due_date || null,
    documentId: doc ? { _id: doc.id, id: doc.id, title: doc.title, originalName: doc.original_name } : e.document_id,
    notes: e.notes || '',
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  };
}

class ExpenseService {
  /**
   * Create a new expense
   */
  async createExpense(userId, data) {
    const dateStr = (data.date ? new Date(data.date) : new Date()).toISOString().split('T')[0];
    const isCollegeFee = Boolean(data.isCollegeFee || data.category === 'college_fee');

    const row = {
      user_id: userId,
      title: data.title.trim(),
      amount: Number(data.amount) || 0,
      category: data.category || (isCollegeFee ? 'college_fee' : 'other'),
      payment_method: data.paymentMethod || 'upi',
      date: dateStr,
      is_college_fee: isCollegeFee,
      fee_details: data.feeDetails || {},
      status: data.status || 'paid',
      due_date: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : null,
      document_id: data.documentId || null,
      notes: data.notes || '',
    };

    const expense = await supabaseDb.insert('expenses', row);
    return mapExpenseToApi(expense);
  }

  /**
   * 1-Click create expense from OCR extracted receipt data
   */
  async createFromOCR(userId, documentId, customData = {}) {
    const doc = await supabaseDb.findById('documents', documentId, userId);
    if (!doc) throw ApiError.notFound('Document not found');

    const ocr = doc.ocr_data || {};
    const amount = customData.amount || ocr.amount;
    if (!amount) {
      throw ApiError.badRequest('Could not determine expense amount from OCR. Please enter manually.');
    }

    const title = customData.title || ocr.vendor || doc.title || 'Scanned Receipt Expense';
    const category =
      customData.category ||
      ocr.detectedCategory ||
      (doc.category === 'fee_slip' ? 'college_fee' : 'other');

    const dateStr = (customData.date || ocr.date ? new Date(customData.date || ocr.date) : new Date())
      .toISOString()
      .split('T')[0];

    const isCollegeFee = category === 'college_fee';

    const row = {
      user_id: userId,
      title,
      amount: Number(amount),
      category,
      payment_method: customData.paymentMethod || 'upi',
      date: dateStr,
      is_college_fee: isCollegeFee,
      document_id: doc.id,
      fee_details: customData.feeDetails || {},
      status: customData.status || 'paid',
      notes: customData.notes || `Extracted via OCR from document "${doc.original_name}"`,
    };

    const expense = await supabaseDb.insert('expenses', row);
    return mapExpenseToApi(expense, doc);
  }

  /**
   * Get filtered expenses
   */
  async getExpenses(userId, { category, status, isCollegeFee, startDate, endDate, search, limit = 50 } = {}) {
    let q = supabaseDb.client
      .from('expenses')
      .select('*, documents(id, title, original_name)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (category && category !== 'all') {
      q = q.eq('category', category);
    }

    if (status && status !== 'all') {
      q = q.eq('status', status);
    }

    if (isCollegeFee !== undefined && isCollegeFee !== '') {
      q = q.eq('is_college_fee', String(isCollegeFee) === 'true');
    }

    if (startDate) {
      q = q.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      q = q.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    if (search && search.trim()) {
      q = q.or(`title.ilike.%${search.trim()}%,notes.ilike.%${search.trim()}%`);
    }

    const { data: expenses } = await q;

    return (expenses || []).map((e) => mapExpenseToApi(e, e.documents));
  }

  /**
   * Get single expense
   */
  async getExpenseById(userId, expenseId) {
    const { data: expense } = await supabaseDb.client
      .from('expenses')
      .select('*, documents(id, title, original_name, file_type, file_size, ocr_text, ocr_data)')
      .eq('id', expenseId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!expense) throw ApiError.notFound('Expense not found');
    return mapExpenseToApi(expense, expense.documents);
  }

  /**
   * Update expense
   */
  async updateExpense(userId, expenseId, data) {
    const existing = await supabaseDb.findById('expenses', expenseId, userId);
    if (!existing) throw ApiError.notFound('Expense not found');

    const updates = {};
    if (data.title !== undefined) updates.title = data.title.trim();
    if (data.amount !== undefined) updates.amount = Number(data.amount);
    if (data.category !== undefined) {
      updates.category = data.category;
      if (data.category === 'college_fee') updates.is_college_fee = true;
    }
    if (data.paymentMethod !== undefined) updates.payment_method = data.paymentMethod;
    if (data.date !== undefined) updates.date = new Date(data.date).toISOString().split('T')[0];
    if (data.isCollegeFee !== undefined) updates.is_college_fee = Boolean(data.isCollegeFee);
    if (data.feeDetails !== undefined) updates.fee_details = data.feeDetails;
    if (data.status !== undefined) updates.status = data.status;
    if (data.dueDate !== undefined) updates.due_date = data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : null;
    if (data.documentId !== undefined) updates.document_id = data.documentId || null;
    if (data.notes !== undefined) updates.notes = data.notes;

    const updated = await supabaseDb.update('expenses', { id: expenseId, user_id: userId }, updates);
    return this.getExpenseById(userId, expenseId);
  }

  /**
   * Delete expense
   */
  async deleteExpense(userId, expenseId) {
    const existing = await supabaseDb.findById('expenses', expenseId, userId);
    if (!existing) throw ApiError.notFound('Expense not found');

    await supabaseDb.delete('expenses', { id: expenseId, user_id: userId });
    return { message: 'Expense deleted successfully' };
  }

  /**
   * Aggregated expense analytics
   */
  async getExpenseStats(userId, { month, year } = {}) {
    const now = new Date();
    const targetMonth = month ? Number(month) - 1 : now.getMonth();
    const targetYear = year ? Number(year) : now.getFullYear();

    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth, 1));
    const endOfMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23, 59, 59, 999));
    const startStr = startOfMonth.toISOString().split('T')[0];
    const endStr = endOfMonth.toISOString().split('T')[0];

    const [monthExpensesRes, allCollegeFeesRes, recentRes] = await Promise.all([
      supabaseDb.client
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startStr)
        .lte('date', endStr),
      supabaseDb.client
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_college_fee', true),
      supabaseDb.client
        .from('expenses')
        .select('*, documents(title)')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const monthExpenses = monthExpensesRes.data || [];
    const allCollegeFees = allCollegeFeesRes.data || [];
    const recentExpenses = (recentRes.data || []).map((e) => mapExpenseToApi(e, e.documents));

    let totalSpentThisMonth = 0;
    const categoryTotals = {};

    monthExpenses.forEach((exp) => {
      if (exp.status === 'paid') {
        const amt = Number(exp.amount) || 0;
        totalSpentThisMonth += amt;
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalSpentThisMonth > 0 ? Math.round((amt / totalSpentThisMonth) * 100) : 0,
    }));

    let totalCollegeFeesPaid = 0;
    let pendingFeesCount = 0;
    let pendingFeesAmount = 0;

    allCollegeFees.forEach((f) => {
      const amt = Number(f.amount) || 0;
      if (f.status === 'paid') {
        totalCollegeFeesPaid += amt;
      } else {
        pendingFeesCount++;
        pendingFeesAmount += amt;
      }
    });

    return {
      totalSpentThisMonth: Number(totalSpentThisMonth.toFixed(2)),
      totalCollegeFeesPaid: Number(totalCollegeFeesPaid.toFixed(2)),
      pendingFeesCount,
      pendingFeesAmount: Number(pendingFeesAmount.toFixed(2)),
      monthName: startOfMonth.toLocaleString('default', { month: 'long' }),
      year: targetYear,
      categoryBreakdown,
      recentExpenses,
    };
  }
}

module.exports = new ExpenseService();
