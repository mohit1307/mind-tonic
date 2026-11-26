import {
  Target,
  CheckCircle2,
  Flame,
  TrendingUp,
} from 'lucide-react';
import Card from '../common/Card';

export default function HabitStatsBar({ stats }) {
  if (!stats) return null;

  const items = [
    {
      title: 'Active Habits',
      value: stats.totalHabits,
      sub: 'Tracked daily',
      icon: Target,
      color: 'text-secondary-400',
      bg: 'bg-secondary-500/10',
    },
    {
      title: "Today's Check-ins",
      value: `${stats.todayCompleted} / ${stats.totalHabits}`,
      sub: `${stats.todayRate}% completed`,
      icon: CheckCircle2,
      color: 'text-success-400',
      bg: 'bg-success-500/10',
    },
    {
      title: 'Best Active Streak',
      value: `${stats.bestStreak} Days`,
      sub: stats.bestStreak > 0 ? 'Consistency high' : 'Start your streak',
      icon: Flame,
      color: 'text-warning-400',
      bg: 'bg-warning-500/10',
    },
    {
      title: 'Daily Completion Rate',
      value: `${stats.todayRate}%`,
      sub: '7-day momentum',
      icon: TrendingUp,
      color: 'text-accent-400',
      bg: 'bg-accent-500/10',
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
