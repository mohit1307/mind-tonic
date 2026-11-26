import { useState, useEffect, useCallback } from 'react';
import habitService from '../services/habitService';

export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await habitService.getHabits();
      setHabits(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await habitService.getStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to fetch habit stats:', err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const createHabit = async (habitData) => {
    const newHabit = await habitService.createHabit(habitData);
    await fetchHabits();
    fetchStats();
    return newHabit;
  };

  const updateHabit = async (id, updates) => {
    const updated = await habitService.updateHabit(id, updates);
    setHabits((prev) => prev.map((h) => (h._id === id ? { ...h, ...updated } : h)));
    fetchStats();
    return updated;
  };

  const deleteHabit = async (id) => {
    await habitService.deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h._id !== id));
    fetchStats();
  };

  // Optimistic toggle for instant feel
  const toggleHabit = async (id, date = new Date()) => {
    const target = habits.find((h) => h._id === id);
    if (!target) return;

    const willBeCompleted = !target.isCompletedToday;

    // Optimistically update
    setHabits((prev) =>
      prev.map((h) =>
        h._id === id
          ? {
              ...h,
              isCompletedToday: willBeCompleted,
              currentStreak: willBeCompleted
                ? h.currentStreak + 1
                : Math.max(0, h.currentStreak - 1),
            }
          : h
      )
    );

    try {
      const result = await habitService.toggleHabit(id, date);
      // Sync real returned streak
      setHabits((prev) =>
        prev.map((h) =>
          h._id === id
            ? {
                ...h,
                isCompletedToday: result.completed,
                currentStreak: result.currentStreak,
                longestStreak: result.longestStreak,
              }
            : h
        )
      );
      fetchStats();
    } catch (err) {
      fetchHabits(); // Revert on failure
      throw err;
    }
  };

  return {
    habits,
    stats,
    loading,
    statsLoading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    refreshHabits: fetchHabits,
    refreshStats: fetchStats,
  };
}

export default useHabits;
