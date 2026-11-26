const Expense = require('../models/Expense');
const Document = require('../models/Document');
const ApiError = require('../utils/apiError');
const { normalizeDate } = require('../utils/timeUtils');

class ExpenseService {
  /**
   * Create a new expense
   */
  async createExpense(userId, data) {
    const date = normalizeDate(data.date || new Date());

    const isCollegeFee =
      data.isCollegeFee || data.category === 'college_fee';

    const expense = await Expense.create({
      userId,
      ...data,
      date,
      isCollegeFee,
    });

    // If a document was linked, update document's reference
    if (data.documentId) {
      await Document.findOneAndUpdate(
        { _id: data.documentId, userId },
        { isLinkedToExpense: true, expenseId: expense._id }
      );
    }

    return expense;
  }

  /**
   * 1-Click create expense from OCR extracted receipt data
   */
  async createFromOCR(userId, documentId, customData = {}) {
    const doc = await Document.findOne({ _id: documentId, userId });
    if (!doc) throw ApiError.notFound('Document not found');

    const ocr = doc.ocrData || {};
    const amount = customData.amount || ocr.amount;
    if (!amount) {
      throw ApiError.badRequest('Could not determine expense amount from OCR. Please enter manually.');
    }

    const title =
      customData.title ||
      ocr.vendor ||
      doc.title ||
      'Scanned Receipt Expense';

    const category =
      customData.category ||
      ocr.detectedCategory ||
      (doc.category === 'fee_challan' ? 'college_fee' : 'personal');

    const date = normalizeDate(customData.date || ocr.date || new Date());
    const isCollegeFee = category === 'college_fee';

    const expense = await Expense.create({
      userId,
      title,
      amount,
      category,
      paymentMethod: customData.paymentMethod || 'upi',
      date,
      isCollegeFee,
      documentId: doc._id,
      feeDetails: customData.feeDetails || {},
      status: customData.status || 'paid',
      notes: customData.notes || `Extracted via OCR from document "${doc.originalName}"`,
    });

    // Mark document as linked
    doc.isLinkedToExpense = true;
    doc.expenseId = expense._id;
    await doc.save();

    return expense;
  }

  /**
   * Get filtered expenses
   */
  async getExpenses(userId, { category, status, isCollegeFee, startDate, endDate, search, limit = 50 } = {}) {
    const query = { userId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (isCollegeFee !== undefined && isCollegeFee !== '') {
      query.isCollegeFee = isCollegeFee === 'true' || isCollegeFee === true;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = normalizeDate(startDate);
      if (endDate) query.date.$lte = normalizeDate(endDate);
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { notes: regex }];
    }

    const expenses = await Expense.find(query)
      .populate('documentId', 'title fileName fileType fileSize')
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit));

    return expenses;
  }

  /**
   * Get single expense
   */
  async getExpenseById(userId, expenseId) {
    const expense = await Expense.findOne({ _id: expenseId, userId }).populate(
      'documentId',
      'title fileName fileType fileSize ocrText ocrData'
    );
    if (!expense) throw ApiError.notFound('Expense not found');
    return expense;
  }

  /**
   * Update expense
   */
  async updateExpense(userId, expenseId, data) {
    const expense = await Expense.findOne({ _id: expenseId, userId });
    if (!expense) throw ApiError.notFound('Expense not found');

    if (data.date) data.date = normalizeDate(data.date);
    if (data.category === 'college_fee') data.isCollegeFee = true;

    // Handle document linking change
    if (data.documentId !== undefined && data.documentId !== expense.documentId?.toString()) {
      // Unlink previous document
      if (expense.documentId) {
        await Document.findByIdAndUpdate(expense.documentId, {
          isLinkedToExpense: false,
          expenseId: null,
        });
      }
      // Link new document
      if (data.documentId) {
        await Document.findOneAndUpdate(
          { _id: data.documentId, userId },
          { isLinkedToExpense: true, expenseId: expense._id }
        );
      }
    }

    Object.assign(expense, data);
    await expense.save();
    return expense;
  }

  /**
   * Delete expense
   */
  async deleteExpense(userId, expenseId) {
    const expense = await Expense.findOne({ _id: expenseId, userId });
    if (!expense) throw ApiError.notFound('Expense not found');

    // Unlink document
    if (expense.documentId) {
      await Document.findByIdAndUpdate(expense.documentId, {
        isLinkedToExpense: false,
        expenseId: null,
      });
    }

    await expense.deleteOne();
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

    const [monthExpenses, allCollegeFees, recentExpenses] = await Promise.all([
      Expense.find({
        userId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      Expense.find({
        userId,
        isCollegeFee: true,
      }),
      Expense.find({ userId })
        .populate('documentId', 'title')
        .sort({ date: -1, createdAt: -1 })
        .limit(5),
    ]);

    // Calculate monthly total
    let totalSpentThisMonth = 0;
    const categoryTotals = {};

    monthExpenses.forEach((exp) => {
      if (exp.status === 'paid') {
        totalSpentThisMonth += exp.amount;
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalSpentThisMonth > 0 ? Math.round((amt / totalSpentThisMonth) * 100) : 0,
    }));

    // College fee stats
    let totalCollegeFeesPaid = 0;
    let pendingFeesCount = 0;
    let pendingFeesAmount = 0;

    allCollegeFees.forEach((f) => {
      if (f.status === 'paid') {
        totalCollegeFeesPaid += f.amount;
      } else {
        pendingFeesCount++;
        pendingFeesAmount += f.amount;
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
