import { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatDuration } from '../../utils/formatters';

export default function RescheduleModal({
  isOpen,
  onClose,
  block,
  suggestions = [],
  onApply,
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!block) return null;

  const handleConfirm = async () => {
    let sTime = '';
    let eTime = '';

    if (useCustom) {
      if (!customStart || !customEnd) {
        setError('Please provide both custom start and end times');
        return;
      }
      sTime = customStart;
      eTime = customEnd;
    } else {
      if (!selectedSlot && suggestions.length > 0) {
        sTime = suggestions[0].startTime;
        eTime = suggestions[0].endTime;
      } else if (selectedSlot) {
        sTime = selectedSlot.startTime;
        eTime = selectedSlot.endTime;
      } else {
        setError('Please select or specify a time slot');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await onApply(block._id, sTime, eTime);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Intelligent Rescheduling"
      size="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-primary-950/60 border border-white/5 space-y-1">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
            Missed Session
          </span>
          <h4 className="text-sm font-bold text-white">{block.title}</h4>
          <p className="text-2xs text-slate-400">
            Originally scheduled: {block.startTime} - {block.endTime}
          </p>
        </div>

        {/* Candidate Slots */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            AI Recommended Available Slots
          </label>

          {suggestions.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              No automatic slots found within preferred working hours today. You may specify a custom time below.
            </p>
          ) : (
            <div className="space-y-2">
              {suggestions.map((slot, index) => {
                const isSelected =
                  (!selectedSlot && index === 0 && !useCustom) ||
                  (selectedSlot?.startTime === slot.startTime && !useCustom);

                return (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => {
                      setSelectedSlot(slot);
                      setUseCustom(false);
                    }}
                    className={`
                      w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all
                      ${
                        isSelected
                          ? 'bg-accent-500/20 text-white border-accent-500/50 shadow-glow-sm'
                          : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/20'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary-950/50 text-accent-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{slot.startTime} - {slot.endTime}</p>
                        <p className="text-2xs text-slate-400">{slot.label}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-400">
                        {formatDuration(slot.durationMins)}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-accent-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Slot Toggle */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              className="w-4 h-4 rounded text-accent-500 bg-primary-950 border-white/20 focus:ring-accent-500/40"
            />
            Or choose a custom time slot
          </label>

          {useCustom && (
            <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
              <div>
                <label className="text-2xs font-medium text-slate-400">Start Time</label>
                <input
                  type="time"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="mt-1 w-full bg-primary-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                />
              </div>
              <div>
                <label className="text-2xs font-medium text-slate-400">End Time</label>
                <input
                  type="time"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="mt-1 w-full bg-primary-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/5">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            loading={loading}
            icon={CheckCircle2}
          >
            Confirm Reschedule
          </Button>
        </div>
      </div>
    </Modal>
  );
}
