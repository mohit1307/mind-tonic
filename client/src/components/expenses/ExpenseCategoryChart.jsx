import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import Card from '../common/Card';

const CATEGORY_COLORS = {
  college_fee: '#6366f1',
  books_stationery: '#06b6d4',
  food: '#10b981',
  transport: '#f59e0b',
  housing_rent: '#ec4899',
  utilities: '#8b5cf6',
  entertainment: '#ef4444',
  personal: '#3b82f6',
  other: '#64748b',
};

export default function ExpenseCategoryChart({ stats }) {
  if (!stats || !stats.categoryBreakdown || stats.categoryBreakdown.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-500 text-xs">
        No spending recorded for this month yet.
      </Card>
    );
  }

  const data = stats.categoryBreakdown.map((c) => ({
    name: c.category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    amount: c.amount,
    percentage: c.percentage,
    color: CATEGORY_COLORS[c.category] || '#6366f1',
  }));

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white tracking-tight">
          Spending by Category ({stats.monthName} {stats.year})
        </h4>
        <span className="text-2xs text-slate-400 font-medium">
          Total: ₹{(stats.totalSpentThisMonth || 0).toLocaleString()}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="₹" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Percentage pills */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-light text-2xs text-slate-300 border border-white/5"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}:</span>
            <span className="font-bold text-white">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
