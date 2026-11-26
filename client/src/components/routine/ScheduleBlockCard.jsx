import {
  Clock,
  Lock,
  Coffee,
  Moon,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { formatDuration, formatTime } from '../../utils/formatters';

const TYPE_CONFIG = {
  fixed: {
    border: 'border-l-4 border-l-amber-500',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: Lock,
    label: 'Fixed Commitment',
  },
  flexible: {
    border: 'border-l-4 border-l-accent-500',
    badge: 'bg-accent-500/15 text-accent-300 border-accent-500/30',
    icon: Sparkles,
    label: 'Scheduled Task',
  },
  break: {
    border: 'border-l-4 border-l-cyan-500',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    icon: Coffee,
    label: 'Recharge Break',
  },
  sleep: {
    border: 'border-l-4 border-l-indigo-500',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    icon: Moon,
    label: 'Sleep Window',
  },
};

export default function ScheduleBlockCard({ block, onStatusChange, onDelete }) {
  const config = TYPE_CONFIG[block.type] || TYPE_CONFIG.flexible;
  const Icon = config.icon;
  const isCompleted = block.status === 'completed';

  // Calculate duration in minutes
  const [sh, sm] = block.startTime.split(':').map(Number);
  const [eh, em] = block.endTime.split(':').map(Number);
  let durationMins = eh * 60 + em - (sh * 60 + sm);
  if (durationMins < 0) durationMins += 1440; // Overnight wrap

  return (
    <div
      className={`
        glass-card p-4 transition-all duration-200 border
        hover:border-white/20 group relative ${config.border}
        ${isCompleted ? 'opacity-60 bg-surface/40' : 'bg-surface/80'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Time & Icon */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-primary-950/60 border border-white/5 flex-shrink-0 text-center min-w-[70px]">
            <span className="text-xs font-bold text-slate-100">{block.startTime}</span>
            <span className="text-2xs text-slate-500 font-medium">to</span>
            <span className="text-xs font-bold text-slate-300">{block.endTime}</span>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold border ${config.badge}`}>
                <Icon className="w-2.5 h-2.5" />
                {config.label}
              </span>

              {durationMins > 0 && (
                <span className="text-2xs text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {formatDuration(durationMins)}
                </span>
              )}

              {block.category && block.type !== 'sleep' && block.type !== 'break' && (
                <span className="text-2xs text-slate-400 bg-white/5 px-1.5 py-0.5 rounded capitalize">
                  {block.category}
                </span>
              )}
            </div>

            <h4
              className={`text-sm font-semibold truncate ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
              }`}
            >
              {block.title}
            </h4>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {block.type !== 'sleep' && (
            <button
              onClick={() =>
                onStatusChange(
                  block._id,
                  isCompleted ? 'scheduled' : 'completed'
                )
              }
              className={`
                p-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all
                ${
                  isCompleted
                    ? 'bg-success-500/20 text-success-300 border-success-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-white/5'
                }
              `}
              title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          {block.type !== 'sleep' && (
            <button
              onClick={() => onDelete(block._id)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Remove block"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
