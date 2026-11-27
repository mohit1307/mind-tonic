import { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  GraduationCap,
  PieChart,
  List,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useExpenses from '../hooks/useExpenses';
import ExpenseStats from '../components/expenses/ExpenseStats';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ExpenseCategoryChart from '../components/expenses/ExpenseCategoryChart';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';

const TABS = [
  { id: 'all', label: 'All Expenses', icon: List },
  { id: 'college', label: 'College Fees & Challans', icon: GraduationCap },
  { id: 'analytics', label: 'Spending Analytics', icon: PieChart },
];

const CATEGORY_NAMES = {
  college_fee: 'College Fee',
  books_stationery: 'Books & Stationery',
  food: 'Food & Dining',
  transport: 'Transport',
  housing_rent: 'Rent / Hostel',
  utilities: 'Bills & Utilities',
  entertainment: 'Entertainment',
  personal: 'Personal',
  other: 'Other',
};

export default function Expenses() {
  const {
    expenses,
    stats,
    category,
    setCategory,
    isCollegeFee,
    setIsCollegeFee,
    status,
    setStatus,
    search,
    setSearch,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  const [activeTab, setActiveTab] = useState('all');
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const collegeExpenses = expenses.filter((e) => e.isCollegeFee);

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setExpenseModalOpen(true);
  };

  const handleTogglePaid = async (exp) => {
    const newStatus = exp.status === 'paid' ? 'pending' : 'paid';
    await updateExpense(exp._id || exp.id, { status: newStatus });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Expenses & College Fees
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track student budgets, log semester tuition challans, and sync verified amounts directly from OCR scanned receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/app/documents">
            <Button variant="secondary" icon={FileText} size="sm">
              Scan Receipt (OCR)
            </Button>
          </Link>

          <Button
            icon={Plus}
            size="sm"
            onClick={() => {
              setEditingExpense(null);
              setExpenseModalOpen(true);
            }}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <ExpenseStats stats={stats} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all
                ${
                  isActive
                    ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40 shadow-glow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}

              {tab.id === 'college' && stats?.pendingFeesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-2xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {stats.pendingFeesCount} due
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-sm">
          {error}
        </div>
      )}

      {/* Tab 1: All Expenses */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-light border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent-500/50"
            />
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader size="lg" />
              <p className="text-sm text-slate-400 mt-3 animate-pulse-soft">
                Loading expenses...
              </p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mx-auto text-accent-400 shadow-glow-sm">
                <DollarSign className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Expenses Recorded Yet</h3>
                <p className="text-sm text-slate-400">
                  Log your daily purchases or scan receipt images in the Documents tab for automated data extraction.
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingExpense(null);
                  setExpenseModalOpen(true);
                }}
                icon={Plus}
                size="lg"
              >
                Log First Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {expenses.map((exp) => (
                <div
                  key={exp._id || exp.id}
                  className="p-4 rounded-2xl bg-surface/80 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-light border border-white/10 flex items-center justify-center text-accent-400 flex-shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                          {CATEGORY_NAMES[exp.category] || exp.category}
                        </span>

                        {exp.isCollegeFee && (
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-300 border border-accent-500/30 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> College Fee
                          </span>
                        )}

                        <span
                          className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${
                            exp.status === 'paid'
                              ? 'bg-success-500/15 text-success-300 border-success-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {exp.status.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">{exp.title}</h4>
                      <p className="text-2xs text-slate-500">
                        {new Date(exp.date).toLocaleDateString()} • {exp.paymentMethod.toUpperCase()}
                        {exp.notes && ` • ${exp.notes}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-base font-extrabold text-white">
                      ₹{exp.amount.toLocaleString()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteExpense(exp._id || exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: College Fees & Challans */}
      {activeTab === 'college' && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-accent-400" />
                Semester Tuition & Institutional Fees
              </h3>
              <p className="text-xs text-slate-400">
                Keep track of academic dues, examination challans, and uploaded bank receipts.
              </p>
            </div>

            <Button
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingExpense(null);
                setExpenseModalOpen(true);
              }}
            >
              Add Fee Bill
            </Button>
          </div>

          {collegeExpenses.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 text-xs">
              No college fees logged yet. Mark any expense as "College / Academic Fee" to view it here.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collegeExpenses.map((fee) => (
                <Card key={fee._id || fee.id} className="p-5 border space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-2xs uppercase tracking-wider font-semibold text-accent-400">
                        {fee.feeDetails?.semester || 'Academic Fee'}
                      </span>
                      <h4 className="text-base font-bold text-white">{fee.title}</h4>
                      {fee.feeDetails?.receiptNumber && (
                        <p className="text-2xs text-slate-400 font-mono">
                          Challan: {fee.feeDetails.receiptNumber}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-2xs font-bold px-2.5 py-1 rounded-full border ${
                        fee.status === 'paid'
                          ? 'bg-success-500/15 text-success-300 border-success-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {fee.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="text-2xs text-slate-500 block">Amount</span>
                      <span className="text-lg font-bold text-white">
                        ₹{fee.amount.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant={fee.status === 'paid' ? 'ghost' : 'secondary'}
                      onClick={() => handleTogglePaid(fee)}
                      icon={CheckCircle2}
                    >
                      {fee.status === 'paid' ? 'Mark Due' : 'Mark as Paid'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Spending Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <ExpenseCategoryChart stats={stats} />
        </div>
      )}

      {/* Modal for adding/editing expense */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={async (data) => {
          if (editingExpense) {
            await updateExpense(editingExpense._id, data);
          } else {
            await createExpense(data);
          }
        }}
        expense={editingExpense}
      />
    </div>
  );
}
