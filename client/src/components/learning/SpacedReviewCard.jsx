import { useState } from 'react';
import { Eye, EyeOff, Sparkles, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

const QUALITY_BUTTONS = [
  { q: 0, label: '0 • Blackout', sub: 'No memory at all', color: 'bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/30' },
  { q: 1, label: '1 • Forgot', sub: 'Remembered on reveal', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/30' },
  { q: 2, label: '2 • Hard', sub: 'Very difficult recall', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/30' },
  { q: 3, label: '3 • Pass', sub: 'Recalled with effort', color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30' },
  { q: 4, label: '4 • Good', sub: 'Small hesitation', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30' },
  { q: 5, label: '5 • Perfect', sub: 'Instant effortless recall', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30' },
];

export default function SpacedReviewCard({
  topic,
  onRate,
  loading = false,
}) {
  const [revealed, setRevealed] = useState(false);

  if (!topic) return null;

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: topic.subjectColor || '#6366f1' }}
          />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {topic.subjectName} {topic.subjectCode ? `(${topic.subjectCode})` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 capitalize">
            {topic.difficulty || 'medium'}
          </span>
          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-300 border border-accent-500/30">
            Rep #{topic.repetitions || 0}
          </span>
        </div>
      </div>

      {/* Front: Prompt / Question */}
      <div className="py-8 px-6 rounded-2xl bg-primary-950/70 border border-white/5 text-center space-y-3">
        <span className="text-2xs font-bold uppercase tracking-widest text-accent-400">
          Active Recall Prompt
        </span>
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {topic.name}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Test your memory: explain the concept, write down equations, or recall key characteristics before revealing.
        </p>
      </div>

      {/* Reveal Toggle */}
      {!revealed ? (
        <div className="text-center pt-2">
          <Button
            size="lg"
            variant="secondary"
            icon={Eye}
            onClick={() => setRevealed(true)}
            className="w-full sm:w-auto"
          >
            Show Answer / Key Concepts
          </Button>
        </div>
      ) : (
        /* Back: Revealed Notes & SM-2 Rating Buttons */
        <div className="space-y-6 animate-slide-up">
          <div className="p-5 rounded-2xl bg-surface-light/70 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent-400" /> Key Concepts & Notes
              </span>
              <button
                onClick={() => setRevealed(false)}
                className="text-2xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <EyeOff className="w-3 h-3" /> Hide
              </button>
            </div>
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {topic.notes || 'No notes were recorded for this topic. Review the concept from your course material.'}
            </p>
          </div>

          {/* SM-2 Recall Rating Buttons */}
          <div className="space-y-3">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block text-center">
              Rate your recall quality (SM-2 Algorithm):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {QUALITY_BUTTONS.map((btn) => (
                <button
                  key={btn.q}
                  disabled={loading}
                  onClick={() => {
                    setRevealed(false);
                    onRate(topic.subjectId, topic.topicId, btn.q);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${btn.color}`}
                >
                  <span className="block text-xs font-bold">{btn.label}</span>
                  <span className="block text-2xs opacity-80 mt-0.5">{btn.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
