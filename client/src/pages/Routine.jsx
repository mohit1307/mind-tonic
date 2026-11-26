import { Link } from 'react-router-dom';
import { Calendar, Sparkles, RefreshCw, Plus, CheckSquare } from 'lucide-react';
import useSchedule from '../hooks/useSchedule';
import DateNavigator from '../components/routine/DateNavigator';
import TimetableGrid from '../components/routine/TimetableGrid';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

export default function Routine() {
  const {
    selectedDate,
    blocks,
    loading,
    generating,
    error,
    changeDate,
    nextDay,
    prevDay,
    goToToday,
    generateTimetable,
    updateBlockStatus,
    deleteBlock,
  } = useSchedule();

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            My Routine & Timetable
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Constraint-based scheduling engine that locks your fixed commitments, fits study tasks, and inserts recharge breaks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/app/tasks">
            <Button variant="secondary" icon={Plus} size="sm">
              Add Tasks
            </Button>
          </Link>
          <Button
            onClick={() => generateTimetable()}
            loading={generating}
            icon={Sparkles}
            size="sm"
          >
            {blocks.length > 0 ? 'Regenerate Routine' : 'Generate Routine'}
          </Button>
        </div>
      </div>

      {/* Date Navigator */}
      <DateNavigator
        selectedDate={selectedDate}
        onPrev={prevDay}
        onNext={nextDay}
        onToday={goToToday}
        onChangeDate={changeDate}
      />

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-sm">
          {error}
        </div>
      )}

      {/* Timetable Content */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader size="lg" />
          <p className="text-sm text-slate-400 mt-3 animate-pulse-soft">
            Loading daily schedule...
          </p>
        </div>
      ) : (
        <TimetableGrid
          blocks={blocks}
          onStatusChange={updateBlockStatus}
          onDeleteBlock={deleteBlock}
          onGenerate={() => generateTimetable()}
          generating={generating}
        />
      )}
    </div>
  );
}
