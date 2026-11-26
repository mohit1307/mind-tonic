import { useState } from 'react';
import {
  Check,
  Flame,
  MoreVertical,
  Edit2,
  Trash2,
  Target,
  Droplets,
  Dumbbell,
  BookOpen,
  Brain,
  Sun,
  Moon,
  Smile,
  Zap,
} from 'lucide-react';

const ICON_MAP = {
  Target,
  Droplets,
  Dumbbell,
  BookOpen,
  Brain,
  Sun,
  Moon,
  Smile,
  Zap,
  Flame,
};

export default function HabitCard({ habit, onToggle, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const IconComponent = ICON_MAP[habit.icon] || Target;
  const isDoneToday = habit.isCompletedToday;

  return (
    <div
      className={`
        glass-card p-4 sm:p-5 transition-all duration-200 border
        hover:border-accent-500/30 group relative
        ${isDoneToday ? 'bg-surface/90 border-white/10' : 'bg-surface/60 border-white/5'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Details */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Custom color icon container */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner-glow transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: `${habit.color}20`,
              color: habit.color,
              border: `1px solid ${habit.color}40`,
            }}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm font-semibold truncate ${
                  isDoneToday ? 'text-slate-200' : 'text-slate-100 group-hover:text-white'
                }`}
              >
                {habit.name}
              </h4>

              {/* Streak Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold ${
                  habit.currentStreak > 0
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-white/5 text-slate-500 border border-white/5'
                }`}
              >
                <Flame className={`w-3 h-3 ${habit.currentStreak > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                {habit.currentStreak} {habit.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>

            {habit.description && (
              <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                {habit.description}
              </p>
            )}

            {/* 7-Day History Mini Row */}
            <div className="pt-2 flex items-center gap-1.5">
              {habit.history7Days?.map((d, index) => (
                <div key={index} className="flex flex-col items-center gap-0.5">
                  <div
                    className={`
                      w-6 h-6 rounded-lg flex items-center justify-center text-2xs font-semibold
                      transition-all duration-200
                      ${
                        d.completed
                          ? 'text-white shadow-glow-sm'
                          : 'bg-white/5 text-slate-600 border border-white/5'
                      }
                    `}
                    style={{
                      backgroundColor: d.completed ? habit.color : undefined,
                    }}
                    title={`${d.date}: ${d.completed ? 'Completed' : 'Missed'}`}
                  >
                    {d.completed ? <Check className="w-3 h-3 stroke-[3]" /> : d.dayName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Big Toggle Checkbox & Action Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(habit._id)}
            className={`
              w-9 h-9 rounded-2xl flex items-center justify-center border transition-all duration-200
              ${
                isDoneToday
                  ? 'text-white shadow-glow'
                  : 'bg-primary-950/60 border-white/20 text-transparent hover:border-accent-400 hover:text-slate-500'
              }
            `}
            style={{
              backgroundColor: isDoneToday ? habit.color : undefined,
              borderColor: isDoneToday ? habit.color : undefined,
            }}
            title={isDoneToday ? 'Mark incomplete for today' : 'Check-in for today!'}
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                onMouseLeave={() => setMenuOpen(false)}
                className="absolute right-0 top-full mt-1 w-32 glass-card p-1 shadow-2xl border border-white/10 z-20 animate-slide-up rounded-xl"
              >
                <button
                  onClick={() => {
                    onEdit(habit);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(habit._id);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 rounded-lg transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
