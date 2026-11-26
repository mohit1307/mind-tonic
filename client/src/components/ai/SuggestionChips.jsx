import { Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'Create my timetable for today',
  'Add task: Study Java concurrency for 2 hours',
  'What tasks are pending today?',
  'Move my Java session to 7 PM',
  'How are my habits doing?',
  'Add task: Gym push day for 1 hour',
];

export default function SuggestionChips({ onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <span className="text-2xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1 flex-shrink-0">
        <Sparkles className="w-3 h-3 text-accent-400" />
        Ideas:
      </span>
      {SUGGESTIONS.map((text) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          className="px-3 py-1 rounded-full bg-white/5 hover:bg-accent-500/20 border border-white/10 hover:border-accent-500/30 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-all duration-200"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
