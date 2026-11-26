const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { normalizeDate } = require('../utils/timeUtils');
const ApiError = require('../utils/apiError');

class HabitService {
  /**
   * Create a new habit
   */
  async createHabit(userId, habitData) {
    const habit = new Habit({
      ...habitData,
      userId,
    });
    return await habit.save();
  }

  /**
   * Get all active habits for user, decorated with today's status & 7-day history
   */
  async getHabits(userId) {
    const habits = await Habit.find({ userId, isActive: true }).sort({ createdAt: -1 });

    const today = normalizeDate(new Date());

    // Generate dates for the past 7 days (including today)
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      past7Days.push(normalizeDate(d));
    }

    const startDate = past7Days[0];

    // Fetch all logs in the past 7 days for these habits
    const habitIds = habits.map((h) => h._id);
    const logs = await HabitLog.find({
      habitId: { $in: habitIds },
      date: { $gte: startDate, $lte: today },
      completed: true,
    });

    // Create lookup map: "habitId_YYYY-MM-DD" -> true
    const logMap = new Set();
    logs.forEach((log) => {
      const dStr = normalizeDate(log.date).toISOString().split('T')[0];
      logMap.add(`${log.habitId}_${dStr}`);
    });

    const todayStr = today.toISOString().split('T')[0];

    // Decorate habits
    return habits.map((h) => {
      const hObj = h.toObject();
      hObj.isCompletedToday = logMap.has(`${h._id}_${todayStr}`);

      // 7-day history array: [{ date, completed }]
      hObj.history7Days = past7Days.map((d) => {
        const dStr = d.toISOString().split('T')[0];
        return {
          date: dStr,
          dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
          completed: logMap.has(`${h._id}_${dStr}`),
        };
      });

      return hObj;
    });
  }

  /**
   * Get single habit with full recent history
   */
  async getHabitById(userId, habitId) {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) throw ApiError.notFound('Habit not found');

    const recentLogs = await HabitLog.find({ habitId, completed: true })
      .sort({ date: -1 })
      .limit(30);

    return {
      habit,
      recentLogs,
    };
  }

  /**
   * Update habit
   */
  async updateHabit(userId, habitId, updates) {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) throw ApiError.notFound('Habit not found');

    Object.assign(habit, updates);
    return await habit.save();
  }

  /**
   * Delete habit (soft delete or hard delete with logs)
   */
  async deleteHabit(userId, habitId) {
    const habit = await Habit.findOneAndDelete({ _id: habitId, userId });
    if (!habit) throw ApiError.notFound('Habit not found');

    // Clean up associated logs
    await HabitLog.deleteMany({ habitId });
    return habit;
  }

  /**
   * Toggle habit completion for a specific date and recalculate streaks
   */
  async toggleHabitLog(userId, habitId, targetDateInput = new Date(), notes = '') {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) throw ApiError.notFound('Habit not found');

    const targetDate = normalizeDate(targetDateInput);

    // Check if log exists
    const existingLog = await HabitLog.findOne({ habitId, date: targetDate });

    let completedNow = false;
    if (existingLog) {
      // Toggle off: remove log
      await HabitLog.deleteOne({ _id: existingLog._id });
      completedNow = false;
    } else {
      // Toggle on: create log
      await HabitLog.create({
        habitId,
        userId,
        date: targetDate,
        completed: true,
        notes,
      });
      completedNow = true;
    }

    // Recalculate streak
    await this._recalculateStreak(habit);

    return {
      habitId,
      date: targetDate,
      completed: completedNow,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
    };
  }

  /**
   * Algorithmic streak computation
   */
  async _recalculateStreak(habit) {
    const today = normalizeDate(new Date());

    // Fetch all logs for this habit sorted descending
    const logs = await HabitLog.find({ habitId: habit._id, completed: true }).sort({ date: -1 });

    const logDates = new Set(
      logs.map((l) => normalizeDate(l.date).toISOString().split('T')[0])
    );

    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = normalizeDate(yesterday).toISOString().split('T')[0];

    let streak = 0;
    let checkDate = new Date(today);

    // If today is completed, start counting from today
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
      // If today is not checked yet, but yesterday was, streak remains alive!
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

    habit.currentStreak = streak;
    habit.longestStreak = Math.max(habit.longestStreak, streak);
    await habit.save();
  }

  /**
   * Get habit statistics & past 7-day completion trend for charts
   */
  async getHabitStats(userId) {
    const habits = await Habit.find({ userId, isActive: true });
    const totalHabits = habits.length;

    const today = normalizeDate(new Date());

    // 7-day trend calculation for Recharts
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      past7Days.push(normalizeDate(d));
    }

    const startDate = past7Days[0];

    const logs = await HabitLog.find({
      userId,
      date: { $gte: startDate, $lte: today },
      completed: true,
    });

    // Map logs by date
    const dailyCounts = {};
    past7Days.forEach((d) => {
      const key = d.toISOString().split('T')[0];
      dailyCounts[key] = 0;
    });

    logs.forEach((log) => {
      const key = normalizeDate(log.date).toISOString().split('T')[0];
      if (dailyCounts[key] !== undefined) {
        dailyCounts[key] += 1;
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

    // Best active streak
    let bestStreak = 0;
    habits.forEach((h) => {
      if (h.currentStreak > bestStreak) bestStreak = h.currentStreak;
    });

    // Today's completion rate
    const todayStr = today.toISOString().split('T')[0];
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
