import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Sparkles, RefreshCw, Plus, CheckSquare } from 'lucide-react';
import useSchedule from '../hooks/useSchedule';
import scheduleService from '../services/scheduleService';
import DateNavigator from '../components/routine/DateNavigator';
import TimetableGrid from '../components/routine/TimetableGrid';
import MissedTaskAlert from '../components/routine/MissedTaskAlert';
import RescheduleModal from '../components/routine/RescheduleModal';
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
    refreshSchedule,
  } = useSchedule();

  const [missedData, setMissedData] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedBlockForModal, setSelectedBlockForModal] = useState(null);
  const [modalSuggestions, setModalSuggestions] = useState([]);

  // Check for missed tasks when date or blocks change
  const checkForMissedTasks = useCallback(async () => {
    try {
      const res = await scheduleService.detectMissed(selectedDate);
      if (res && res.missedCount > 0) {
        setMissedData(res);
        setAlertDismissed(false);
      } else {
        setMissedData(null);
      }
    } catch {
      setMissedData(null);
    }
  }, [selectedDate]);

  useEffect(() => {
    checkForMissedTasks();
  }, [checkForMissedTasks, blocks]);

  // Handle 1-click quick reschedule from alert banner
  const handleQuickReschedule = async (blockId, startTime, endTime) => {
    try {
      await scheduleService.applyMissed(selectedDate, blockId, startTime, endTime);
      await refreshSchedule();
      await checkForMissedTasks();
    } catch (err) {
      alert(err.message || 'Failed to reschedule missed task');
    }
  };

  // Open full modal for reviewing candidate slots
  const handleOpenModal = async (block, initialSuggestions = []) => {
    setSelectedBlockForModal(block);
    if (initialSuggestions.length > 0) {
      setModalSuggestions(initialSuggestions);
    } else {
      try {
        const res = await scheduleService.suggestMissed(selectedDate, block._id);
        setModalSuggestions(res.data?.suggestions || res.suggestions || []);
      } catch {
        setModalSuggestions([]);
      }
    }
    setRescheduleModalOpen(true);
  };

  // Confirm rescheduling from modal
  const handleModalApply = async (blockId, newStartTime, newEndTime) => {
    await scheduleService.applyMissed(selectedDate, blockId, newStartTime, newEndTime);
    await refreshSchedule();
    await checkForMissedTasks();
  };

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

      {/* Missed Task Intelligent Rescheduling Banner */}
      {!alertDismissed && missedData && missedData.missedBlocks?.length > 0 && (
        <MissedTaskAlert
          missedData={missedData}
          onQuickReschedule={handleQuickReschedule}
          onOpenModal={(block, suggs) => handleOpenModal(block, suggs)}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

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
          onRescheduleBlock={(block) => handleOpenModal(block)}
          onGenerate={() => generateTimetable()}
          generating={generating}
        />
      )}

      {/* Reschedule Alternative Slot Picker Modal */}
      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => {
          setRescheduleModalOpen(false);
          setSelectedBlockForModal(null);
        }}
        block={selectedBlockForModal}
        suggestions={modalSuggestions}
        onApply={handleModalApply}
      />
    </div>
  );
}
