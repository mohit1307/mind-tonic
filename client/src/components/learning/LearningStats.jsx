import { BookOpen, Clock, CheckCircle2, Award, Sparkles } from 'lucide-react';
import Card from '../common/Card';

export default function LearningStats({ stats }) {
  if (!stats) return null;

  const items = [
    {
      label: 'Total Study Time',
      value: `${stats.totalStudyHours} hrs`,
      icon: Clock,
      color: 'text-accent-400',
      bg: 'bg-accent-500/10 border-accent-500/20',
    },
    {
      label: 'Subjects Tracked',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'text-secondary-400',
      bg: 'bg-secondary-500/10 border-secondary-500/20',
    },
    {
      label: 'Topics Mastered',
      value: `${stats.masteredTopics} / ${stats.totalTopics}`,
      icon: Award,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      sub: `${stats.masteryRate}% mastery rate`,
    },
    {
      label: 'Reviews Due Today',
      value: stats.dueReviewsCount,
      icon: Sparkles,
      color: stats.dueReviewsCount > 0 ? 'text-cyan-400' : 'text-slate-400',
      bg: stats.dueReviewsCount > 0 ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-white/5 border-white/5',
      sub: stats.dueReviewsCount > 0 ? 'Active recall queue' : 'All caught up!',
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
              <span className="text-2xl font-bold text-white tracking-tight">{it.value}</span>
              {it.sub && <p className="text-2xs text-slate-400 mt-0.5">{it.sub}</p>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
