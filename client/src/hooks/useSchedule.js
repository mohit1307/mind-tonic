import { useState, useEffect, useCallback } from 'react';
import scheduleService from '../services/scheduleService';

export function useSchedule(initialDate = new Date()) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleService.getScheduleByDate(selectedDate);
      setSchedule(data);
    } catch (err) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const generateTimetable = async (options = {}) => {
    setGenerating(true);
    setError(null);
    try {
      const data = await scheduleService.generateSchedule({
        date: selectedDate.toISOString(),
        ...options,
      });
      setSchedule(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to generate timetable');
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  const updateBlockStatus = async (blockId, status) => {
    try {
      // Optimistic update
      setSchedule((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocks: prev.blocks.map((b) => (b._id === blockId ? { ...b, status } : b)),
        };
      });

      const updated = await scheduleService.updateBlock(selectedDate, blockId, { status });
      setSchedule(updated);
    } catch (err) {
      fetchSchedule(); // Revert on failure
      throw err;
    }
  };

  const deleteBlock = async (blockId) => {
    try {
      const updated = await scheduleService.deleteBlock(selectedDate, blockId);
      setSchedule(updated);
    } catch (err) {
      setError(err.message || 'Failed to remove block');
      throw err;
    }
  };

  const changeDate = (newDate) => {
    setSelectedDate(new Date(newDate));
  };

  const nextDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const prevDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return {
    selectedDate,
    schedule,
    blocks: schedule?.blocks || [],
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
    refreshSchedule: fetchSchedule,
  };
}

export default useSchedule;
