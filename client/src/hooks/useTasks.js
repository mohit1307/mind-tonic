import { useState, useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';

export function useTasks(initialFilters = {}) {
  const {
    tasks: allTasks,
    stats,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    refreshTasks,
  } = useTaskContext();

  const [filters, setFilters] = useState({
    status: 'all',
    category: '',
    priority: '',
    search: '',
    page: 1,
    limit: 50,
    ...initialFilters,
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      category: '',
      priority: '',
      search: '',
      page: 1,
      limit: 50,
    });
  };

  // Filter tasks in-memory for instant responsive UI
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'overdue') {
          const isOverdue =
            t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date();
          if (!isOverdue) return false;
        } else if (t.status !== filters.status) {
          return false;
        }
      }

      if (filters.category && filters.category !== 'all' && t.category !== filters.category) {
        return false;
      }

      if (filters.priority && filters.priority !== 'all') {
        const p = t.priority === 'urgent' ? 'critical' : t.priority;
        const fP = filters.priority === 'urgent' ? 'critical' : filters.priority;
        if (p !== fP) return false;
      }

      if (filters.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const matchTitle = (t.title || '').toLowerCase().includes(q);
        const matchDesc = (t.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [allTasks, filters]);

  const updateStatus = async (id, status) => {
    return updateTask(id, { status });
  };

  return {
    tasks: filteredTasks,
    allTasks,
    stats,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    updateStatus,
    refreshTasks,
  };
}

export default useTasks;
