import { useState, useEffect } from 'react';
import { DollarSign, GraduationCap, AlertCircle, Plus } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const CATEGORIES = [
  { id: 'college_fee', label: 'College / Tuition Fee' },
  { id: 'books_stationery', label: 'Books & Stationery' },
  { id: 'food', label: 'Food & Dining' },
  { id: 'transport', label: 'Travel & Transport' },
  { id: 'housing_rent', label: 'Rent / Hostel' },
  { id: 'utilities', label: 'Bills & Utilities' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'personal', label: 'Personal' },
  { id: 'other', label: 'Other' },
];

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / Google Pay / PhonePe' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'net_banking', label: 'Net Banking' },
  { id: 'cash', label: 'Cash' },
  { id: 'other', label: 'Other' },
];

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  expense = null,
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('personal');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('paid');
  const [dueDate, setDueDate] = useState('');
  const [isCollegeFee, setIsCollegeFee] = useState(false);
  const [semester, setSemester] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      setAmount(expense.amount || '');
      setCategory(expense.category || 'personal');
      setPaymentMethod(expense.paymentMethod || 'upi');
      setDate(
        expense.date
          ? new Date(expense.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setStatus(expense.status || 'paid');
      setDueDate(
        expense.dueDate
          ? new Date(expense.dueDate).toISOString().split('T')[0]
          : ''
      );
      setIsCollegeFee(expense.isCollegeFee || expense.category === 'college_fee');
      setSemester(expense.feeDetails?.semester || '');
      setReceiptNumber(expense.feeDetails?.receiptNumber || '');
      setNotes(expense.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategory('personal');
      setPaymentMethod('upi');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('paid');
      setDueDate('');
      setIsCollegeFee(false);
      setSemester('');
      setReceiptNumber('');
      setNotes('');
    }
    setError('');
  }, [expense, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Expense title is required');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please provide a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        amount: Number(amount),
        category,
        paymentMethod,
        date,
        status,
        dueDate: dueDate || null,
        isCollegeFee: isCollegeFee || category === 'college_fee',
        feeDetails:
          isCollegeFee || category === 'college_fee'
            ? { semester: semester.trim(), receiptNumber: receiptNumber.trim() }
            : {},
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? 'Edit Expense' : 'Add New Expense'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Expense Title"
          placeholder="e.g. Semester 4 Tuition Fee, Cafeteria lunch, Java algorithms book"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                if (val === 'college_fee') setIsCollegeFee(true);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-accent-500/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-accent-500/50"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Transaction Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Status selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-accent-500/50"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending / Due</option>
              <option value="due_soon">Due Soon</option>
            </select>
          </div>

          {status !== 'paid' && (
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          )}
        </div>

        {/* College fee checkbox & details */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCollegeFee || category === 'college_fee'}
              onChange={(e) => setIsCollegeFee(e.target.checked)}
              className="w-4 h-4 rounded text-accent-500 bg-surface-light border-white/10 focus:ring-accent-500"
            />
            <span className="text-xs font-medium text-slate-300">
              Track as College / Academic Fee
            </span>
          </label>
        </div>

        {(isCollegeFee || category === 'college_fee') && (
          <div className="p-3.5 rounded-xl bg-surface-light border border-white/10 grid grid-cols-2 gap-3 animate-fade-in">
            <Input
              label="Semester / Academic Year"
              placeholder="e.g. Semester 4"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
            <Input
              label="Receipt / Challan Number"
              placeholder="e.g. DIT-2026-88"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="Additional remarks or merchant notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-surface-light border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent-500/50"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {expense ? 'Update Expense' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
