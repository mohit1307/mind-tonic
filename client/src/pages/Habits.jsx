import { useState } from 'react';
import { Plus, Target, Sparkles, AlertCircle } from 'lucide-react';
import useHabits from '../hooks/useHabits';
import HabitCard from '../components/habits/HabitCard';
import HabitModal from '../components/habits/HabitModal';
import HabitStatsBar from '../components/habits/HabitStatsBar';
import HabitProgressChart from '../components/habits/HabitProgressChart';
import Button from '../components/common/Button';
import Loader, { EmptyState } from '../components/common/Loader';

export default function Habits() {
  const {
    habits,
    stats,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
  } = useHabits();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const handleSaveHabit = async (habitData) => {
    if (editingHabit) {
      await updateHabit(editingHabit._id, habitData);
    } else {
      await createHabit(habitData);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit and its history?')) {
      await deleteHabit(habitId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Habit Tracker
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Build lasting consistency with daily check-ins, automated streaks, and weekly visual progress analytics.
          </p>
        </div>

        <Button onClick={handleOpenCreate} icon={Plus} size="md">
          New Habit
        </Button>
      </div>

      {/* Stats Bar */}
      <HabitStatsBar stats={stats} />

      {/* Recharts Weekly Progress Trend */}
      {stats?.weeklyChartData && stats.weeklyChartData.length > 0 && (
        <HabitProgressChart chartData={stats.weeklyChartData} />
      )}

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Habits List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center">
            <Loader size="lg" />
            <p className="text-sm text-slate-400 mt-3 animate-pulse-soft">Loading habits...</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="glass-card">
            <EmptyState
              icon={Target}
              title="No habits registered yet"
              description="Start building your routine: add reading, morning workouts, water intake, or practice habits."
              action={
                <Button onClick={handleOpenCreate} icon={Plus} size="sm">
                  Create First Habit
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {habits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onToggle={toggleHabit}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <HabitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveHabit}
        habit={editingHabit}
      />
    </div>
  );
}
