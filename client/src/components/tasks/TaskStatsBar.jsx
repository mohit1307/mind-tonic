import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import Card from '../common/Card';

export default function TaskStatsBar({ stats }) {
  if (!stats) return null;

  const items = [
    {
      title: 'Total Tasks',
      value: stats.total,
      sub: 'All registered',
      icon: CheckSquare,
      color: 'text-secondary-400',
      bg: 'bg-secondary-500/10',
    },
    {
      title: 'Pending',
      value: stats.pending,
      sub: 'Awaiting execution',
      icon: Clock,
      color: 'text-accent-400',
      bg: 'bg-accent-500/10',
    },
    {
      title: 'Completed',
      value: stats.completed,
      sub: `${stats.completionRate}% completion`,
      icon: CheckCircle2,
      color: 'text-success-400',
      bg: 'bg-success-500/10',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      sub: stats.overdue > 0 ? 'Requires attention' : 'All on track',
      icon: AlertTriangle,
      color: stats.overdue > 0 ? 'text-danger-400' : 'text-slate-400',
      bg: stats.overdue > 0 ? 'bg-danger-500/10' : 'bg-slate-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <Card key={item.title} className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {item.title}
            </span>
            <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-white">
              {item.value}
            </span>
          </div>
          <p className="mt-1 text-2xs text-slate-500 truncate">{item.sub}</p>
        </Card>
      ))}
    </div>
  );
}
