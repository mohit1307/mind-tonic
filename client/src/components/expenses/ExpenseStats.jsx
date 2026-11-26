import { DollarSign, GraduationCap, Clock, PieChart } from 'lucide-react';
import Card from '../common/Card';

export default function ExpenseStats({ stats }) {
  if (!stats) return null;

  const topCategory = stats.categoryBreakdown?.[0]?.category || 'N/A';

  const items = [
    {
      label: 'Spent This Month',
      value: `₹${(stats.totalSpentThisMonth || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-accent-400',
      bg: 'bg-accent-500/10 border-accent-500/20',
      sub: `${stats.monthName} ${stats.year}`,
    },
    {
      label: 'College Fees Paid',
      value: `₹${(stats.totalCollegeFeesPaid || 0).toLocaleString()}`,
      icon: GraduationCap,
      color: 'text-success-400',
      bg: 'bg-success-500/10 border-success-500/20',
      sub: 'Tuition & Semester Challans',
    },
    {
      label: 'Pending Fees / Bills',
      value: `₹${(stats.pendingFeesAmount || 0).toLocaleString()}`,
      icon: Clock,
      color: stats.pendingFeesCount > 0 ? 'text-amber-400' : 'text-slate-400',
      bg: stats.pendingFeesCount > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/5',
      sub: `${stats.pendingFeesCount} fee bill(s) due`,
    },
    {
      label: 'Top Spending Category',
      value: topCategory.replace('_', ' '),
      icon: PieChart,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      sub: 'Budget allocation',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card key={it.label} className="p-4 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex items-start justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                {it.label}
              </span>
              <div className={`p-2 rounded-xl border ${it.bg}`}>
                <Icon className={`w-4 h-4 ${it.color}`} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white tracking-tight capitalize">
                {it.value}
              </span>
              {it.sub && <p className="text-2xs text-slate-400 mt-0.5">{it.sub}</p>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
