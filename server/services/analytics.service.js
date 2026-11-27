const { supabaseDb } = require('../db/supabaseDb');
const { normalizeDate } = require('../utils/timeUtils');

class AnalyticsService {
  /**
   * Aggregate overall productivity analytics across all modules
   */
  async getAnalyticsOverview(userId) {
    const today = normalizeDate(new Date());

    // 1. Fetch data from Supabase PostgreSQL in parallel
    const [tasksRes, habitsRes, sessionsRes, expensesRes] = await Promise.all([
      supabaseDb.client.from('tasks').select('*').eq('user_id', userId),
      supabaseDb.client.from('habits').select('*').eq('user_id', userId).eq('is_active', true),
      supabaseDb.client
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      supabaseDb.client.from('expenses').select('*').eq('user_id', userId),
    ]);

    const tasks = tasksRes.data || [];
    const habits = habitsRes.data || [];
    const studySessions = sessionsRes.data || [];
    const expenses = expensesRes.data || [];

    // 2. Task metrics
    let completedTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;
    const now = new Date();

    tasks.forEach((t) => {
      if (t.status === 'completed') completedTasks++;
      else if (t.status === 'in_progress') inProgressTasks++;
      else pendingTasks++;

      if (t.status !== 'completed' && t.deadline && new Date(t.deadline) < now) {
        overdueTasks++;
      }
    });

    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 3. 7-Day Focus Study Trend
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const focusTrend7Days = [];
    let total7DayFocusMins = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i, 0, 0, 0, 0));
      const dStr = d.toISOString().split('T')[0];
      const daySessions = studySessions.filter((s) => s.date === dStr);

      const dayMins = daySessions.reduce((acc, s) => acc + (Number(s.duration_minutes) || 0), 0);
      total7DayFocusMins += dayMins;

      focusTrend7Days.push({
        date: dStr,
        day: dayNames[d.getUTCDay()],
        hours: Number((dayMins / 60).toFixed(1)),
        sessionsCount: daySessions.length,
      });
    }

    // 4. Habit metrics
    let bestHabitStreak = 0;
    let totalStreakDays = 0;
    habits.forEach((h) => {
      if ((h.current_streak || 0) > bestHabitStreak) bestHabitStreak = h.current_streak;
      totalStreakDays += h.current_streak || 0;
    });

    const habitConsistencyScore =
      habits.length > 0 ? Math.min(100, Math.round((totalStreakDays / (habits.length * 7)) * 100)) : 0;

    // 5. Expense & College Fee summary
    let upcomingFeeDuesCount = 0;
    let totalFeeDuesAmount = 0;

    expenses.forEach((e) => {
      if (e.is_college_fee && e.status !== 'paid') {
        upcomingFeeDuesCount++;
        totalFeeDuesAmount += Number(e.amount) || 0;
      }
    });

    // 6. Overall Mind Tonic Productivity Index (0 - 100)
    const taskWeight = taskCompletionRate * 0.4;
    const habitWeight = habitConsistencyScore * 0.3;
    const focusTargetHours = 20; // 20 hours/week goal
    const focusHoursAchieved = total7DayFocusMins / 60;
    const focusWeight = Math.min(100, (focusHoursAchieved / focusTargetHours) * 100) * 0.3;

    const overallProductivityScore = Math.min(100, Math.round(taskWeight + habitWeight + focusWeight));

    return {
      metrics: {
        taskCompletionRate,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        habitStreakBest: bestHabitStreak,
        habitConsistencyScore,
        totalFocusHours7Days: Number((total7DayFocusMins / 60).toFixed(1)),
        upcomingFeeDuesCount,
        totalFeeDuesAmount: Number(totalFeeDuesAmount.toFixed(2)),
        overallProductivityScore,
      },
      focusTrend: focusTrend7Days,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new AnalyticsService();
