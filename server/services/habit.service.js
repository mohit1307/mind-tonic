const { supabaseDb } = require('../db/supabaseDb');
const { normalizeDate } = require('../utils/timeUtils');
const ApiError = require('../utils/apiError');

function mapHabitToApi(h) {
  if (!h) return null;
  return {
    _id: h.id,
    id: h.id,
    userId: h.user_id,
    name: h.name,
    category: h.category || 'health',
    frequency: h.frequency || 'daily',
    targetDaysPerWeek: h.target_days_per_week ?? 7,
    currentStreak: h.current_streak || 0,
    longestStreak: h.longest_streak || 0,
    isActive: h.is_active !== false,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  };
}

class HabitService {
  /**
   * Create a new habit
   */
  async createHabit(userId, habitData) {
    const row = {
      user_id: userId,
      name: habitData.name.trim(),
      category: habitData.category || 'health',
      frequency: habitData.frequency || 'daily',
      target_days_per_week: habitData.targetDaysPerWeek || 7,
      current_streak: 0,
      longest_streak: 0,
      is_active: true,
    };

    const created = await supabaseDb.insert('habits', row);
    return mapHabitToApi(created);
  }

  /**
   * Get all active habits for user, decorated with today's status & 7-day history
   */
  async getHabits(userId) {
    const { data: dbHabits } = await supabaseDb.client
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const habits = (dbHabits || []).map(mapHabitToApi);
    const today = normalizeDate(new Date());

    // Generate dates for the past 7 days (including today)
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      past7Days.push(normalizeDate(d));
    }

    const startDateStr = past7Days[0].toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const habitIds = habits.map((h) => h.id);
    let logMap = new Set();

    if (habitIds.length > 0) {
      const { data: logs } = await supabaseDb.client
        .from('habit_logs')
        .select('habit_id, date')
        .in('habit_id', habitIds)
        .gte('date', startDateStr)
        .lte('date', todayStr);

      (logs || []).forEach((log) => {
        logMap.add(`${log.habit_id}_${log.date}`);
      });
    }

    // Decorate habits
    return habits.map((h) => {
      const isCompletedToday = logMap.has(`${h.id}_${todayStr}`);
      const history7Days = past7Days.map((d) => {
        const dStr = d.toISOString().split('T')[0];
        return {
          date: dStr,
          dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
          completed: logMap.has(`${h.id}_${dStr}`),
        };
      });

      return {
        ...h,
        isCompletedToday,
        history7Days,
      };
    });
  }

  /**
   * Get single habit with full recent history
   */
  async getHabitById(userId, habitId) {
    const habit = await supabaseDb.findById('habits', habitId, userId);
    if (!habit) throw ApiError.notFound('Habit not found');

    const { data: logs } = await supabaseDb.client
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false })
      .limit(30);

    return {
      habit: mapHabitToApi(habit),
      recentLogs: logs || [],
    };
  }

  /**
   * Update habit
   */
  async updateHabit(userId, habitId, updates) {
    const habit = await supabaseDb.findById('habits', habitId, userId);
    if (!habit) throw ApiError.notFound('Habit not found');

    const rowUpdates = {};
    if (updates.name !== undefined) rowUpdates.name = updates.name.trim();
    if (updates.category !== undefined) rowUpdates.category = updates.category;
    if (updates.frequency !== undefined) rowUpdates.frequency = updates.frequency;
    if (updates.targetDaysPerWeek !== undefined) rowUpdates.target_days_per_week = updates.targetDaysPerWeek;
    if (updates.isActive !== undefined) rowUpdates.is_active = updates.isActive;

    const updated = await supabaseDb.update('habits', { id: habitId, user_id: userId }, rowUpdates);
    return mapHabitToApi(updated?.[0] || { ...habit, ...rowUpdates });
  }

  /**
   * Delete habit
   */
  async deleteHabit(userId, habitId) {
    const habit = await supabaseDb.findById('habits', habitId, userId);
    if (!habit) throw ApiError.notFound('Habit not found');

    await supabaseDb.delete('habits', { id: habitId, user_id: userId });
    return mapHabitToApi(habit);
  }

  /**
   * Toggle habit completion for a specific date and recalculate streaks
   */
  async toggleHabitLog(userId, habitId, targetDateInput = new Date(), notes = '') {
    const habit = await supabaseDb.findById('habits', habitId, userId);
    if (!habit) throw ApiError.notFound('Habit not found');

    const targetDate = normalizeDate(targetDateInput);
    const dateStr = targetDate.toISOString().split('T')[0];

    const existingLog = await supabaseDb.findOne('habit_logs', {
      habit_id: habitId,
      date: dateStr,
    });

    let completedNow = false;
    if (existingLog) {
      await supabaseDb.delete('habit_logs', { id: existingLog.id });
      completedNow = false;
    } else {
      await supabaseDb.insert('habit_logs', {
        habit_id: habitId,
        user_id: userId,
        date: dateStr,
        notes,
      });
      completedNow = true;
    }

    const { currentStreak, longestStreak } = await this._recalculateStreak(habitId, habit.longest_streak || 0);

    return {
      habitId,
      date: targetDate,
      completed: completedNow,
      currentStreak,
      longestStreak,
    };
  }

  /**
   * Algorithmic streak computation
   */
  async _recalculateStreak(habitId, previousLongest = 0) {
    const today = normalizeDate(new Date());

    const { data: logs } = await supabaseDb.client
      .from('habit_logs')
      .select('date')
      .eq('habit_id', habitId)
      .order('date', { ascending: false });

    const logDates = new Set((logs || []).map((l) => l.date));
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = normalizeDate(yesterday).toISOString().split('T')[0];

    let streak = 0;
    let checkDate = new Date(today);

    if (logDates.has(todayStr)) {
      while (true) {
        const dStr = normalizeDate(checkDate).toISOString().split('T')[0];
        if (logDates.has(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else if (logDates.has(yesterdayStr)) {
      checkDate = new Date(yesterday);
      while (true) {
        const dStr = normalizeDate(checkDate).toISOString().split('T')[0];
        if (logDates.has(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      streak = 0;
    }

    const longestStreak = Math.max(previousLongest, streak);
    await supabaseDb.update(
      'habits',
      { id: habitId },
      {
        current_streak: streak,
        longest_streak: longestStreak,
      }
    );

    return { currentStreak: streak, longestStreak };
  }

  /**
   * Get habit statistics & past 7-day completion trend for charts
   */
  async getHabitStats(userId) {
    const { data: habits } = await supabaseDb.client
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    const totalHabits = (habits || []).length;
    const today = normalizeDate(new Date());

    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      past7Days.push(normalizeDate(d));
    }

    const startDateStr = past7Days[0].toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const { data: logs } = await supabaseDb.client
      .from('habit_logs')
      .select('date')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .lte('date', todayStr);

    const dailyCounts = {};
    past7Days.forEach((d) => {
      const key = d.toISOString().split('T')[0];
      dailyCounts[key] = 0;
    });

    (logs || []).forEach((log) => {
      if (dailyCounts[log.date] !== undefined) {
        dailyCounts[log.date] += 1;
      }
    });

    const chartData = past7Days.map((d) => {
      const key = d.toISOString().split('T')[0];
      const count = dailyCounts[key] || 0;
      const rate = totalHabits > 0 ? Math.round((count / totalHabits) * 100) : 0;
      return {
        date: key,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: count,
        total: totalHabits,
        rate,
      };
    });

    let bestStreak = 0;
    (habits || []).forEach((h) => {
      if (h.current_streak > bestStreak) bestStreak = h.current_streak;
    });

    const todayCompleted = dailyCounts[todayStr] || 0;
    const todayRate = totalHabits > 0 ? Math.round((todayCompleted / totalHabits) * 100) : 0;

    return {
      totalHabits,
      todayCompleted,
      todayRate,
      bestStreak,
      weeklyChartData: chartData,
    };
  }
}

module.exports = new HabitService();
