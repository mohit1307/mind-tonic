import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  CheckSquare,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Button from '../common/Button';

const ACTION_TITLES = {
  create_task: { label: 'Create New Task', icon: CheckSquare, color: 'text-secondary-400' },
  generate_schedule: { label: 'Generate Timetable', icon: Calendar, color: 'text-accent-400' },
  reschedule_block: { label: 'Reschedule Session', icon: Clock, color: 'text-warning-400' },
  reschedule_missed: { label: 'Reschedule Missed Task', icon: Clock, color: 'text-amber-400' },
  complete_task: { label: 'Complete Task', icon: CheckCircle2, color: 'text-success-400' },
  create_habit: { label: 'Create Habit', icon: Target, color: 'text-purple-400' },
  log_habit: { label: 'Habit Check-in', icon: Target, color: 'text-purple-400' },
};

export default function ActionCard({ action, onConfirm, onReject }) {
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  if (!action) return null;

  const config = ACTION_TITLES[action.type] || {
    label: 'Proposed Action',
    icon: Sparkles,
    color: 'text-accent-400',
  };
  const Icon = config.icon;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(action.actionId);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await onReject(action.actionId);
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="mt-3 p-4 rounded-2xl bg-surface-light/60 border border-white/10 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Icon className={`w-4 h-4 ${config.color}`} />
          {config.label}
        </span>

        {action.status === 'executed' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-success-500/15 text-success-300 border border-success-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Executed
          </span>
        )}

        {action.status === 'rejected' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-danger-500/15 text-danger-300 border border-danger-500/30">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        )}
      </div>

      {/* Action Parameters Preview */}
      <div className="p-2.5 rounded-xl bg-primary-950/50 border border-white/5 text-xs text-slate-300 space-y-1">
        {action.type === 'create_task' && (
          <>
            <p className="font-semibold text-white">Title: {action.parameters.title}</p>
            <p className="text-slate-400 text-2xs">
              Duration: {action.parameters.estimatedDuration}m • Priority: {action.parameters.priority} • Category: {action.parameters.category}
            </p>
          </>
        )}

        {action.type === 'generate_schedule' && (
          <p className="text-slate-300">
            Engine will slot all pending deliverables and preserve fixed commitments.
          </p>
        )}

        {action.type === 'reschedule_block' && (
          <>
            <p className="font-semibold text-white">Session: {action.parameters.title}</p>
            <p className="text-slate-400 text-2xs">
              New Time: <span className="text-accent-300 font-semibold">{action.parameters.startTime} - {action.parameters.endTime}</span>
            </p>
          </>
        )}

        {action.type === 'reschedule_missed' && (
          <>
            <p className="font-semibold text-white">Missed Task: {action.parameters.title || 'Focus Task'}</p>
            <p className="text-slate-400 text-2xs">
              Rescheduled Slot: <span className="text-amber-300 font-semibold">{action.parameters.newStartTime} - {action.parameters.newEndTime}</span>
            </p>
          </>
        )}

        {action.type === 'create_habit' && (
          <p className="font-semibold text-white">Habit: {action.parameters.name} ({action.parameters.frequency})</p>
        )}
      </div>

      {/* Execution confirmation result message */}
      {action.status === 'executed' && action.result?.message && (
        <p className="text-2xs text-success-400 font-medium">{action.result.message}</p>
      )}

      {/* Action Buttons */}
      {action.status === 'pending_confirmation' && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleConfirm}
            loading={loading}
            icon={CheckCircle2}
            className="flex-1"
          >
            Confirm & Execute
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReject}
            loading={rejecting}
            className="text-slate-400 hover:text-danger-400"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
