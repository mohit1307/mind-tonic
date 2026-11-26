import { Zap, Award, CheckCircle2, Flame, Clock } from 'lucide-react';
import Card from '../common/Card';

export default function ProductivityScoreCard({ score, grade, taskMetrics, avgStreak, focusHours }) {
  const taskRate = taskMetrics?.taskCompletionRate || 0;
  const habitRate = Math.min(100, (avgStreak || 0) * 20);
  const focusRate = Math.min(100, Math.round(((focusHours || 0) / 14) * 100)); // 14h weekly target

  return (
    <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-900/90 to-accent-950/40 border border-white/10 shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Big Score & Grade */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-accent-500/10 border-2 border-accent-500/30 flex flex-col items-center justify-center text-center shadow-glow-sm flex-shrink-0">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {score || 0}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-400">
              Flow Score
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent-500/20 text-accent-300 border border-accent-500/30">
                {grade || 'B (Solid Progress)'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Weekly Productivity Index
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Calculated dynamically from your completed tasks, sustained habit streaks, and dedicated focus study hours.
            </p>
          </div>
        </div>

        {/* Right: Sub-pillar indicators */}
        <div className="w-full lg:w-72 space-y-2.5 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
          {/* Deliverables */}
          <div className="space-y-1">
            <div className="flex justify-between text-2xs text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3 text-success-400" /> Deliverables Completed
              </span>
              <span className="font-bold text-white">{taskRate}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-success-500 transition-all duration-500"
                style={{ width: `${taskRate}%` }}
              />
            </div>
          </div>

          {/* Habit Momentum */}
          <div className="space-y-1">
            <div className="flex justify-between text-2xs text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Flame className="w-3 h-3 text-amber-400" /> Habit Consistency
              </span>
              <span className="font-bold text-white">{avgStreak || 0}d avg</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${habitRate}%` }}
              />
            </div>
          </div>

          {/* Focus Study Hours */}
          <div className="space-y-1">
            <div className="flex justify-between text-2xs text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-cyan-400" /> 7-Day Focus Hours
              </span>
              <span className="font-bold text-white">{focusHours || 0}h / 14h</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${focusRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
