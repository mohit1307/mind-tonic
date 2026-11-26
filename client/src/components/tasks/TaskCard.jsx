import {
  Check,
  Clock,
  Calendar,
  Lock,
  MoreVertical,
  Trash2,
  Edit2,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '../common/Badge';
import { formatDuration, formatDate, formatTime } from '../../utils/formatters';

const PRIORITY_BADGES = {
  critical: { color: 'danger', label: 'Critical' },
  high: { color: 'warning', label: 'High' },
  medium: { color: 'secondary', label: 'Medium' },
  low: { color: 'neutral', label: 'Low' },
};

const CATEGORY_COLORS = {
  work: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  study: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  personal: 'text-green-400 bg-green-500/10 border-green-500/20',
  health: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  other: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

export default function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isCompleted = task.status === 'completed';
  const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;

  const isOverdue =
    !isCompleted && task.deadline && new Date(task.deadline) < new Date();

  return (
    <div
      className={`
        glass-card p-4 transition-all duration-200 border
        hover:border-accent-500/30 group relative
        ${isCompleted ? 'opacity-70 bg-surface/40' : 'bg-surface/80'}
        ${isOverdue ? 'border-danger-500/40 bg-danger-500/5' : 'border-white/5'}
      `}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion checkbox button */}
        <button
          onClick={() => onToggleComplete(task._id)}
          className={`
            mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0
            transition-all duration-200
            ${
              isCompleted
                ? 'bg-success-500 border-success-500 text-white shadow-glow-sm'
                : 'border-white/20 hover:border-accent-400 bg-primary-950/50'
            }
          `}
          title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-sm font-semibold transition-all truncate ${
                isCompleted
                  ? 'line-through text-slate-400'
                  : 'text-slate-100 group-hover:text-white'
              }`}
            >
              {task.title}
            </h4>

            {/* Fixed Commitment indicator */}
            {task.isFixed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Lock className="w-2.5 h-2.5" />
                Fixed {task.fixedStartTime} - {task.fixedEndTime}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata pill badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* Category */}
            <span
              className={`text-2xs font-medium px-2 py-0.5 rounded-md border capitalize ${
                CATEGORY_COLORS[task.category] || CATEGORY_COLORS.other
              }`}
            >
              {task.category}
            </span>

            {/* Priority */}
            <Badge color={priorityInfo.color} size="sm">
              {priorityInfo.label}
            </Badge>

            {/* Duration */}
            {task.estimatedDuration && (
              <span className="inline-flex items-center gap-1 text-2xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                <Clock className="w-3 h-3 text-slate-500" />
                {formatDuration(task.estimatedDuration)}
              </span>
            )}

            {/* Deadline */}
            {task.deadline && (
              <span
                className={`inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md border ${
                  isOverdue
                    ? 'bg-danger-500/15 text-danger-300 border-danger-500/30 font-semibold'
                    : 'bg-white/5 text-slate-400 border-white/5'
                }`}
              >
                {isOverdue ? (
                  <AlertTriangle className="w-3 h-3 text-danger-400" />
                ) : (
                  <Calendar className="w-3 h-3 text-slate-500" />
                )}
                {formatDate(task.deadline, { month: 'short', day: 'numeric' })}
                {isOverdue && ' (Overdue)'}
              </span>
            )}

            {/* Tags */}
            {task.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 text-2xs text-slate-400 bg-surface-light px-1.5 py-0.5 rounded"
              >
                <Tag className="w-2.5 h-2.5 text-slate-500" />
                {tag}
              </span>
            ))}
          </div>
        </div>

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
              className="absolute right-0 top-full mt-1 w-36 glass-card p-1.5 shadow-2xl border border-white/10 z-20 animate-slide-up rounded-xl"
            >
              <button
                onClick={() => {
                  onEdit(task);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Task
              </button>

              <button
                onClick={() => {
                  onDelete(task._id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 rounded-lg transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
