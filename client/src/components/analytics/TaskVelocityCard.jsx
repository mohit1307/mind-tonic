import { CheckSquare, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Card from '../common/Card';

export default function TaskVelocityCard({ metrics }) {
  if (!metrics) return null;

  const items = [
    { label: 'Completed', value: metrics.completedTasks, color: 'text-success-400', bg: 'bg-success-500/10' },
    { label: 'In Progress', value: metrics.inProgressTasks, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { label: 'Pending', value: metrics.pendingTasks, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Overdue', value: metrics.overdueTasks, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-accent-400" />
          Deliverables Velocity
        </h4>
        <span className="text-xs font-bold text-success-400">
          {metrics.taskCompletionRate}% completed
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.label} className={`p-3 rounded-xl border border-white/5 ${it.bg}`}>
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
              {it.label}
            </span>
            <span className={`text-xl font-bold mt-1 block ${it.color}`}>
              {it.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
