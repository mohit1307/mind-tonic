import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';

const TaskContext = createContext(null);

const DEFAULT_SEED_TASKS = [
  {
    _id: 'task-seed-1',
    id: 'task-seed-1',
    title: 'Complete DSA Practice',
    priority: 'high',
    category: 'study',
    status: 'pending',
    estimatedDuration: 90,
    deadline: new Date().toISOString(),
    isFixed: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'task-seed-2',
    id: 'task-seed-2',
    title: 'Revise Java Generics',
    priority: 'medium',
    category: 'study',
    status: 'pending',
    estimatedDuration: 60,
    deadline: new Date().toISOString(),
    isFixed: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'task-seed-3',
    id: 'task-seed-3',
    title: 'Prepare for Placement Drive',
    priority: 'low',
    category: 'college',
    status: 'pending',
    estimatedDuration: 120,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    isFixed: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'task-seed-4',
    id: 'task-seed-4',
    title: 'College Lectures',
    priority: 'urgent',
    category: 'college',
    status: 'in_progress',
    estimatedDuration: 420,
    isFixed: true,
    fixedStartTime: '09:00',
    fixedEndTime: '16:00',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'task-seed-5',
    id: 'task-seed-5',
    title: 'Morning Workout & Cardio',
    priority: 'medium',
    category: 'health',
    status: 'completed',
    estimatedDuration: 60,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'task-seed-6',
    id: 'task-seed-6',
    title: 'Operating Systems Virtual Memory Lab',
    priority: 'high',
    category: 'study',
    status: 'completed',
    estimatedDuration: 90,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: 'task-seed-7',
    id: 'task-seed-7',
    title: 'SQL Database Indexing Exercises',
    priority: 'medium',
    category: 'study',
    status: 'completed',
    estimatedDuration: 60,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    _id: 'task-seed-8',
    id: 'task-seed-8',
    title: 'Computer Networks Socket Programming',
    priority: 'medium',
    category: 'study',
    status: 'completed',
    estimatedDuration: 75,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(DEFAULT_SEED_TASKS);
  const [stats, setStats] = useState({
    total: 12,
    completed: 8,
    inProgress: 1,
    pending: 3,
    overdue: 0,
    completionRate: 67,
    priorityDistribution: { high: 4, medium: 6, low: 2, urgent: 1 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Compute live statistics from tasks
  const computeStatsFromList = (taskList) => {
    const total = taskList.length;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let overdue = 0;
    const now = new Date();
    const priorityMap = { high: 0, medium: 0, low: 0, urgent: 0 };

    taskList.forEach((t) => {
      if (t.status === 'completed') completed++;
      else if (t.status === 'in_progress') inProgress++;
      else pending++;

      if (t.status !== 'completed' && t.deadline && new Date(t.deadline) < now) {
        overdue++;
      }

      const p = t.priority === 'critical' ? 'urgent' : t.priority || 'medium';
      if (priorityMap[p] !== undefined) priorityMap[p]++;
    });

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      priorityDistribution: priorityMap,
    };
  };

  // Fetch from backend
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks({ limit: 50 });
      const backendTasks = res.data || res.tasks || [];
      if (backendTasks.length > 0) {
        setTasks(backendTasks);
        setStats(computeStatsFromList(backendTasks));
      } else {
        // If backend is empty, use seed tasks and calculate stats
        setTasks(DEFAULT_SEED_TASKS);
        setStats(computeStatsFromList(DEFAULT_SEED_TASKS));
      }
    } catch (err) {
      console.warn('TaskContext load fallback:', err.message);
      setStats(computeStatsFromList(tasks));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create task — synced globally across all pages
  const createTask = async (taskData) => {
    setError(null);
    let createdItem = null;

    try {
      createdItem = await taskService.createTask(taskData);
    } catch (err) {
      console.warn('Backend task create fallback:', err.message);
    }

    const newTask = createdItem || {
      _id: `task-${Date.now()}`,
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'study',
      status: taskData.status || 'pending',
      estimatedDuration: Number(taskData.estimatedDuration) || 60,
      deadline: taskData.deadline || new Date().toISOString(),
      isFixed: Boolean(taskData.isFixed),
      fixedStartTime: taskData.fixedStartTime || null,
      fixedEndTime: taskData.fixedEndTime || null,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => {
      const updated = [newTask, ...prev.filter((t) => t.id !== newTask.id && t._id !== newTask._id)];
      setStats(computeStatsFromList(updated));
      return updated;
    });

    window.dispatchEvent(new CustomEvent('mindtonic:task-sync', { detail: { action: 'create', task: newTask } }));
    return newTask;
  };

  // Update task — synced globally
  const updateTask = async (taskId, updates) => {
    setError(null);
    try {
      await taskService.updateTask(taskId, updates);
    } catch (err) {
      console.warn('Backend task update fallback:', err.message);
    }

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId || t._id === taskId ? { ...t, ...updates } : t));
      setStats(computeStatsFromList(updated));
      return updated;
    });

    window.dispatchEvent(new CustomEvent('mindtonic:task-sync', { detail: { action: 'update', taskId, updates } }));
  };

  // Toggle complete — synced globally
  const toggleComplete = async (taskId) => {
    setError(null);
    let target = tasks.find((t) => t.id === taskId || t._id === taskId);
    const newStatus = target && target.status === 'completed' ? 'pending' : 'completed';

    try {
      await taskService.toggleComplete(taskId);
    } catch (err) {
      console.warn('Backend task toggle fallback:', err.message);
    }

    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId || t._id === taskId ? { ...t, status: newStatus } : t
      );
      setStats(computeStatsFromList(updated));
      return updated;
    });

    window.dispatchEvent(new CustomEvent('mindtonic:task-sync', { detail: { action: 'toggle', taskId, newStatus } }));
  };

  // Delete task — synced globally
  const deleteTask = async (taskId) => {
    setError(null);
    try {
      await taskService.deleteTask(taskId);
    } catch (err) {
      console.warn('Backend task delete fallback:', err.message);
    }

    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId && t._id !== taskId);
      setStats(computeStatsFromList(updated));
      return updated;
    });

    window.dispatchEvent(new CustomEvent('mindtonic:task-sync', { detail: { action: 'delete', taskId } }));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        toggleComplete,
        refreshTasks: fetchTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
