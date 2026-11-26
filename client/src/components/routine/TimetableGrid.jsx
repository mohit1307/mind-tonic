import { Clock, Lock, Coffee, Sparkles, CheckCircle2 } from 'lucide-react';
import ScheduleBlockCard from './ScheduleBlockCard';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatDuration } from '../../utils/formatters';

export default function TimetableGrid({
  blocks = [],
  onStatusChange,
  onDeleteBlock,
  onRescheduleBlock,
  onGenerate,
  generating = false,
}) {
  if (blocks.length === 0) {
    return (
      <div className="glass-card p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mx-auto text-accent-400 shadow-glow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">No Timetable Generated Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Mind Tonic can instantly organize your pending tasks, college hours, and breaks into an optimized timeline.
          </p>
        </div>
        <Button onClick={onGenerate} loading={generating} icon={Sparkles} size="lg">
          Generate Today's Routine
        </Button>
      </div>
    );
  }

  // Calculate summary metrics
  let fixedMins = 0;
  let flexibleMins = 0;
  let breakMins = 0;
  let completedCount = 0;

  blocks.forEach((b) => {
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    let dur = eh * 60 + em - (sh * 60 + sm);
    if (dur < 0) dur += 1440;

    if (b.type === 'fixed') fixedMins += dur;
    if (b.type === 'flexible') flexibleMins += dur;
    if (b.type === 'break') breakMins += dur;
    if (b.status === 'completed') completedCount += 1;
  });

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-accent-400" /> Focus Time
          </span>
          <p className="text-lg font-bold text-white mt-1">{formatDuration(flexibleMins)}</p>
        </Card>

        <Card className="p-3.5">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400" /> Fixed Hours
          </span>
          <p className="text-lg font-bold text-white mt-1">{formatDuration(fixedMins)}</p>
        </Card>

        <Card className="p-3.5">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Coffee className="w-3 h-3 text-cyan-400" /> Rest Breaks
          </span>
          <p className="text-lg font-bold text-white mt-1">{formatDuration(breakMins)}</p>
        </Card>

        <Card className="p-3.5">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-success-400" /> Completed
          </span>
          <p className="text-lg font-bold text-white mt-1">
            {completedCount} / {blocks.filter((b) => b.type !== 'sleep').length}
          </p>
        </Card>
      </div>

      {/* Sequential Timeline Blocks */}
      <div className="space-y-3">
        {blocks.map((block) => (
          <ScheduleBlockCard
            key={block._id || `${block.startTime}-${block.title}`}
            block={block}
            onStatusChange={onStatusChange}
            onDelete={onDeleteBlock}
            onReschedule={onRescheduleBlock}
          />
        ))}
      </div>
    </div>
  );
}
