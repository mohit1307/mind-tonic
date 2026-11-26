import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const EXPENSE_CATEGORIES = [
  { id: 'college_fee', label: 'College / Tuition Fee' },
  { id: 'books_stationery', label: 'Books & Stationery' },
  { id: 'food', label: 'Food & Dining' },
  { id: 'transport', label: 'Travel & Transport' },
  { id: 'housing_rent', label: 'Rent / Hostel' },
  { id: 'utilities', label: 'Bills & Utilities' },
  { id: 'personal', label: 'Personal' },
  { id: 'other', label: 'Other' },
];

export default function OCRReviewModal({
  isOpen,
  onClose,
  document,
  onConfirmExpense,
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('personal');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('');
  const [semester, setSemester] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (document) {
      const ocr = document.ocrData || {};
      setTitle(ocr.vendor || document.title || '');
      setAmount(ocr.amount || '');
      setCategory(
        ocr.detectedCategory ||
          (document.category === 'fee_challan' ? 'college_fee' : 'personal')
      );
      setDate(
        ocr.date
          ? new Date(ocr.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setPaymentMethod('upi');
      setNotes(
        ocr.vendor
          ? `Verified receipt from ${ocr.vendor}`
          : `Extracted from ${document.originalName}`
      );
    }
    setError('');
  }, [document, isOpen]);

  if (!document) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please provide a valid expense amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirmExpense({
        documentId: document._id,
        title: title.trim() || 'Verified Expense',
        amount: Number(amount),
        category,
        paymentMethod,
        date,
        isCollegeFee: category === 'college_fee',
        feeDetails:
          category === 'college_fee'
            ? { semester: semester.trim(), receiptNumber: receiptNumber.trim() }
            : {},
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create expense from OCR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify OCR Extracted Data"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-white">Automated OCR Extraction</p>
            <p className="text-amber-200/80">
              Mind Tonic parsed this bill automatically. Confirm or adjust the values below before recording to your budget.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Merchant / Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Total Amount (₹)"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-accent-500/50"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
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

        {/* If College Fee Category, show fee-specific fields */}
        {category === 'college_fee' && (
          <div className="p-3.5 rounded-xl bg-surface-light border border-white/10 grid grid-cols-2 gap-3 animate-fade-in">
            <Input
              label="Semester / Year"
              placeholder="e.g. Semester 4"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
            <Input
              label="Challan / Receipt #"
              placeholder="e.g. REC-8912"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
            />
          </div>
        )}

        {/* Accordion for Raw Extracted OCR Text */}
        <div className="border border-white/5 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className="w-full px-3.5 py-2.5 text-xs text-slate-400 hover:text-white flex items-center justify-between bg-primary-950/40"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-accent-400" /> View Raw OCR Extracted Text
            </span>
            {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showRawText && (
            <div className="p-3 bg-primary-950/70 border-t border-white/5 max-h-36 overflow-y-auto font-mono text-2xs text-slate-300 whitespace-pre-wrap">
              {document.ocrText || 'No text content available.'}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={CheckCircle2}>
            Confirm & Save Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
