import { useState } from 'react';
import { Plus, CheckSquare, Sparkles, AlertCircle } from 'lucide-react';
import useTasks from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskFilterBar from '../components/tasks/TaskFilterBar';
import TaskStatsBar from '../components/tasks/TaskStatsBar';
import Button from '../components/common/Button';
import Loader, { EmptyState } from '../components/common/Loader';

export default function Tasks() {
  const {
    tasks,
    stats,
    loading,
    error,
    filters,
    updateFilter,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    updateStatus,
  } = useTasks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await updateTask(editingTask._id, taskData);
    } else {
      await createTask(taskData);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Task Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Create, categorize, set fixed commitments, and manage your daily deliverables.
          </p>
        </div>

        <Button onClick={handleOpenCreate} icon={Plus} size="md">
          New Task
        </Button>
      </div>

      {/* Stats Bar */}
      <TaskStatsBar stats={stats} />

      {/* Filter & Search Bar */}
      <div className="glass-card p-4">
        <TaskFilterBar filters={filters} onFilterChange={updateFilter} />
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center">
            <Loader size="lg" />
            <p className="text-sm text-slate-400 mt-3 animate-pulse-soft">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-card">
            <EmptyState
              icon={CheckSquare}
              title="No tasks found"
              description={
                filters.search || filters.category || filters.status !== 'all'
                  ? 'No tasks match your selected filter criteria. Try clearing some filters.'
                  : "You haven't created any tasks yet. Add flexible tasks or fixed commitments like College or Work."
              }
              action={
                <Button onClick={handleOpenCreate} icon={Plus} size="sm">
                  Create First Task
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggleComplete={toggleComplete}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteTask}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
}
