import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Save, Star } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function StudyTimerModal({
  isOpen,
  onClose,
  subjects = [],
  initialSubjectId = null,
  onSaveSession,
}) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId || '');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [focusRating, setFocusRating] = useState(4);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-set selected subject if initialSubjectId changes or fallback to first subject
  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
    } else if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0]._id);
    }
  }, [initialSubjectId, subjects]);

  // Stopwatch timer interval
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
      setSeconds(0);
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  const currentSubject = subjects.find((s) => s._id === selectedSubjectId);
  const topics = currentSubject?.topics || [];

  const formatStopwatch = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const handleSave = async () => {
    if (!selectedSubjectId) {
      setError('Please select a subject to log study time');
      return;
    }

    const durationMins = Math.max(1, Math.round(seconds / 60));

    setSaving(true);
    setError('');
    try {
      await onSaveSession({
        subjectId: selectedSubjectId,
        topicId: selectedTopicId || null,
        durationMinutes: durationMins,
        focusRating,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save study session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Focus Study Timer"
      size="md"
    >
      <div className="space-y-5 text-center">
        {error && (
          <div className="p-3 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs text-left">
            {error}
          </div>
        )}

        {/* Big Animated Stopwatch Display */}
        <div className="py-6 px-4 rounded-3xl bg-primary-950/70 border border-white/5 relative overflow-hidden">
          <div
            className={`text-5xl sm:text-6xl font-black font-mono tracking-wider transition-colors ${
              isActive ? 'text-accent-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-slate-200'
            }`}
          >
            {formatStopwatch(seconds)}
          </div>
          <span className="text-2xs uppercase tracking-widest text-slate-500 font-semibold mt-2 block">
            {isActive ? '● Focus Session Running' : seconds > 0 ? 'Paused' : 'Ready to Start'}
          </span>
        </div>

        {/* Stopwatch Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={handleToggleTimer}
            icon={isActive ? Pause : Play}
            className={isActive ? 'bg-amber-500 hover:bg-amber-600 text-primary-950' : ''}
          >
            {isActive ? 'Pause Timer' : seconds > 0 ? 'Resume' : 'Start Focus Session'}
          </Button>

          {seconds > 0 && (
            <Button size="lg" variant="ghost" onClick={handleReset} icon={RotateCcw}>
              Reset
            </Button>
          )}
        </div>

        {/* Session Meta Form */}
        <div className="pt-2 text-left space-y-3.5 border-t border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedTopicId('');
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface-light border border-white/10 text-white text-xs focus:outline-none focus:border-accent-500/50"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.code ? `(${s.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Topic (Optional)
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-light border border-white/10 text-white text-xs focus:outline-none focus:border-accent-500/50"
              >
                <option value="">-- General Subject Study --</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Focus Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFocusRating(star)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    star <= focusRating
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'text-slate-600 border-white/5 hover:text-slate-400'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
              <span className="text-2xs text-slate-400 ml-2">
                {focusRating === 5
                  ? 'Deep Flow'
                  : focusRating === 4
                  ? 'High Focus'
                  : focusRating === 3
                  ? 'Normal'
                  : 'Distracted'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Session Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="What did you accomplish in this block?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-light border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent-500/50"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            icon={Save}
            disabled={seconds === 0}
          >
            Save & Log Session ({Math.max(1, Math.round(seconds / 60))}m)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
