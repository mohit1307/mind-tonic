import { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';

export function useTasks(initialFilters = {}) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: 'all',
    category: '',
    priority: '',
    search: '',
    page: 1,
    limit: 50,
    ...initialFilters,
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanParams = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== 'all' && v !== null && v !== undefined) {
          cleanParams[k] = v;
        }
      });

      const response = await taskService.getTasks(cleanParams);
      setTasks(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await taskService.getStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to fetch task stats:', err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const createTask = async (taskData) => {
    const newTask = await taskService.createTask(taskData);
    setTasks((prev) => [newTask, ...prev]);
    fetchStats();
    return newTask;
  };

  const updateTask = async (id, updates) => {
    const updated = await taskService.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    fetchStats();
    return updated;
  };

  const deleteTask = async (id) => {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => (t._id !== id)));
    fetchStats();
  };

  // Optimistic toggle for instant UI responsiveness
  const toggleComplete = async (id) => {
    const targetTask = tasks.find((t) => t._id === id);
    if (!targetTask) return;

    const willBeCompleted = targetTask.status !== 'completed';

    // Optimistically update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === id
          ? {
              ...t,
              status: willBeCompleted ? 'completed' : 'pending',
              completedAt: willBeCompleted ? new Date().toISOString() : null,
            }
          : t
      )
    );

    try {
      const updated = await taskService.toggleComplete(id);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      fetchStats();
    } catch (err) {
      // Revert if API failed
      setTasks((prev) => prev.map((t) => (t._id === id ? targetTask : t)));
      throw err;
    }
  };

  const updateStatus = async (id, status) => {
    const updated = await taskService.updateStatus(id, status);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    fetchStats();
    return updated;
  };

  const updateFilter = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  return {
    tasks,
    stats,
    pagination,
    loading,
    statsLoading,
    error,
    filters,
    updateFilter,
    refreshTasks: fetchTasks,
    refreshStats: fetchStats,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    updateStatus,
  };
}

export default useTasks;
