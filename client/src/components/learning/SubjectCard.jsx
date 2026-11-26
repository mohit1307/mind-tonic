import { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const CONFIDENCE_BADGES = {
  low: 'bg-danger-500/15 text-danger-300 border-danger-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  high: 'bg-success-500/15 text-success-300 border-success-500/30',
};

const DIFFICULTY_BADGES = {
  easy: 'text-slate-400',
  medium: 'text-amber-400',
  hard: 'text-rose-400',
};

export default function SubjectCard({
  subject,
  onStartTimer,
  onAddTopic,
  onEditSubject,
  onDeleteSubject,
  onToggleTopicComplete,
  onDeleteTopic,
}) {
  const [expanded, setExpanded] = useState(false);

  const stats = subject.stats || {};
  const topics = subject.topics || [];
  const hoursStudied = stats.totalStudyHours || 0;
  const targetHours = subject.targetHours || 20;
  const hoursPct = stats.hoursProgressPercent || 0;

  return (
    <Card className="p-5 border hover:border-white/20 transition-all space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-glow-sm"
            style={{ backgroundColor: subject.color || '#6366f1' }}
          >
            <BookOpen className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white truncate">{subject.name}</h3>
              {subject.code && (
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 uppercase">
                  {subject.code}
                </span>
              )}
            </div>

            {subject.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subject.description}</p>
            )}

            {/* Target Hours Progress */}
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-2xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-accent-400" />
                  {hoursStudied}h / {targetHours}h studied
                </span>
                <span className="font-semibold text-slate-300">{hoursPct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, hoursPct)}%`,
                    backgroundColor: subject.color || '#6366f1',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            size="sm"
            onClick={() => onStartTimer(subject._id)}
            icon={Play}
            className="bg-accent-500/20 text-accent-300 border-accent-500/40 hover:bg-accent-500/30 font-semibold"
          >
            Timer
          </Button>

          <button
            onClick={() => onAddTopic(subject)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
            title="Add Topic"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEditSubject(subject)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
            title="Edit Subject"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDeleteSubject(subject._id)}
            className="p-2 rounded-xl text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 transition-colors border border-white/5"
            title="Delete Subject"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Topic Count & Expand Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>{topics.length} topics in syllabus</span>
          <span>•</span>
          <span className="text-success-400 font-semibold">
            {stats.completedTopics || 0} completed
          </span>
          {stats.dueCount > 0 && (
            <>
              <span>•</span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {stats.dueCount} due for review
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
        >
          {expanded ? 'Collapse' : 'View Syllabus'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Topics List */}
      {expanded && (
        <div className="pt-2 space-y-2 border-t border-white/5 animate-fade-in">
          {topics.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No topics added yet. Click "+ Add Topic" above to populate your syllabus.
            </p>
          ) : (
            topics.map((topic) => (
              <div
                key={topic._id}
                className="p-3 rounded-xl bg-surface-light/40 border border-white/5 flex items-center justify-between gap-3 group hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() =>
                      onToggleTopicComplete(subject._id, topic._id, !topic.isCompleted)
                    }
                    className={`p-1 rounded-lg transition-colors ${
                      topic.isCompleted
                        ? 'text-success-400 hover:text-success-300'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        topic.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {topic.name}
                    </p>
                    {topic.notes && (
                      <p className="text-2xs text-slate-500 truncate">{topic.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-2xs uppercase tracking-wider font-semibold ${
                      DIFFICULTY_BADGES[topic.difficulty] || 'text-slate-400'
                    }`}
                  >
                    {topic.difficulty}
                  </span>

                  <span
                    className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${
                      CONFIDENCE_BADGES[topic.confidence] || CONFIDENCE_BADGES.low
                    }`}
                  >
                    {topic.confidence}
                  </span>

                  <button
                    onClick={() => onDeleteTopic(subject._id, topic._id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-danger-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Topic"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}
