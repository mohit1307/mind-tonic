import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Calendar,
  Flame,
} from 'lucide-react';

export default function AdminAnalytics() {
  const [timeframe, setTimeframe] = useState('30D');

  const stats = [
    { title: 'Weekly Active Students', value: '2,140', change: '+18%', icon: Users, color: 'text-purple-400 bg-purple-500/15' },
    { title: 'Tasks Completed This Month', value: '14,320', change: '+24%', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/15' },
    { title: 'Schedules Generated', value: '8,410', change: '+11%', icon: Calendar, color: 'text-blue-400 bg-blue-500/15' },
    { title: 'Active Habit Streaks', value: '1,890', change: '+15%', icon: Flame, color: 'text-amber-400 bg-amber-500/15' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Platform Analytics & Adoption
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry on scheduling utilization, habit retention, and study sessions.
          </p>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-[#10172B] border border-white/10">
          {['7D', '30D', '90D', '1Y'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeframe === t
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="p-5 rounded-2xl bg-[#10172B]/90 border border-white/[0.07] shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {s.change}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs font-medium text-slate-400 mt-0.5">{s.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Engagement Distribution Card */}
      <div className="p-6 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Daily Hourly Peak Traffic Distribution</h3>
        <p className="text-xs text-slate-400">
          Students interact with Mind Tonic primarily at 08:30 AM (morning routine review) and 18:00 - 21:00 PM (study & workout check-ins).
        </p>

        <div className="h-40 flex items-end justify-between gap-1 pt-6 px-4">
          {[
            { time: '06h', val: 20 },
            { time: '08h', val: 85 },
            { time: '10h', val: 45 },
            { time: '12h', val: 35 },
            { time: '14h', val: 30 },
            { time: '16h', val: 60 },
            { time: '18h', val: 95 },
            { time: '20h', val: 100 },
            { time: '22h', val: 75 },
            { time: '00h', val: 25 },
          ].map((bar) => (
            <div key={bar.time} className="flex-1 flex flex-col items-center gap-2">
              <div
                style={{ height: `${bar.val}%` }}
                className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-blue-600 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all hover:brightness-125"
              />
              <span className="text-[10px] font-semibold text-slate-500">{bar.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
