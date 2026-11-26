import { AlertTriangle, Clock, ArrowRight, RefreshCw, X } from 'lucide-react';
import Button from '../common/Button';

export default function MissedTaskAlert({
  missedData,
  onQuickReschedule,
  onOpenModal,
  onDismiss,
}) {
  if (!missedData || !missedData.missedBlocks || missedData.missedBlocks.length === 0) {
    return null;
  }

  const primaryMissed = missedData.missedBlocks[0];
  const block = primaryMissed.block;
  const bestSuggestion = primaryMissed.suggestions?.[0];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 animate-slide-up shadow-xl relative">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-amber-400 hover:text-white hover:bg-white/5 transition-colors"
        title="Dismiss alert"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Missed Task Detected
              </span>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                Was {block.startTime} - {block.endTime}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white">
              "{block.title}" was not completed in its scheduled slot.
            </h4>
            {bestSuggestion ? (
              <p className="text-xs text-amber-200/90 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Next available open slot found:{' '}
                <strong className="text-white font-bold">{bestSuggestion.startTime} - {bestSuggestion.endTime}</strong>
              </p>
            ) : (
              <p className="text-xs text-amber-200/80">
                No open slots remaining before bedtime. Would you like to check custom slots?
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {bestSuggestion && (
            <Button
              size="sm"
              onClick={() =>
                onQuickReschedule(
                  block._id,
                  bestSuggestion.startTime,
                  bestSuggestion.endTime
                )
              }
              icon={RefreshCw}
              className="bg-amber-500 hover:bg-amber-600 text-primary-950 font-bold"
            >
              Reschedule to {bestSuggestion.startTime}
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenModal(block, primaryMissed.suggestions || [])}
            className="text-amber-300 hover:text-white"
          >
            All Slots <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
