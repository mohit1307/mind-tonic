import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../common/Button';

export default function DateNavigator({
  selectedDate,
  onPrev,
  onNext,
  onToday,
  onChangeDate,
}) {
  const isToday =
    new Date(selectedDate).toDateString() === new Date().toDateString();

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const dateValue = new Date(selectedDate).toISOString().split('T')[0];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 glass-card">
      {/* Date display & quick picker */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {formattedDate}
            {isToday && (
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-300 border border-accent-500/30">
                Today
              </span>
            )}
          </h3>
          <p className="text-2xs text-slate-400">Daily Routine Timetable</p>
        </div>
      </div>

      {/* Nav Controls */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <input
          type="date"
          value={dateValue}
          onChange={(e) => {
            if (e.target.value) onChangeDate(new Date(e.target.value));
          }}
          className="bg-primary-950/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
        />

        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={onToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-xl text-accent-300 bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/30 transition-colors"
            >
              Today
            </button>
          )}

          <button
            onClick={onNext}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
