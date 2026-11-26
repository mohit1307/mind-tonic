import { Flame, Target } from 'lucide-react';
import Card from '../common/Card';

export default function HabitMatrixCard({ habits = [] }) {
  if (habits.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-500 text-xs">
        No active habits tracked yet. Create habits in the Habit Tracker tab to monitor consistency.
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          Habit Streak Consistency
        </h4>
        <span className="text-2xs text-slate-400 font-medium">
          {habits.length} habits tracked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {habits.map((h) => (
          <div
            key={h.habitId}
            className="p-3.5 rounded-xl bg-surface-light/50 border border-white/5 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <span className="text-2xs font-semibold uppercase text-slate-500 block truncate">
                {h.category}
              </span>
              <h5 className="text-xs font-bold text-white truncate">{h.name}</h5>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex-shrink-0">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-extrabold">{h.currentStreak}d</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
