const Task = require('../models/Task');
const Schedule = require('../models/Schedule');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const StudySession = require('../models/StudySession');
const Subject = require('../models/Subject');
const Expense = require('../models/Expense');
const { normalizeDate } = require('../utils/timeUtils');

class AnalyticsService {
  /**
   * Aggregate overall productivity analytics across all modules
   */
  async getAnalyticsOverview(userId) {
    const today = normalizeDate(new Date());

    // 1. Fetch data in parallel
    const [tasks, habits, studySessions, subjects, expenses] = await Promise.all([
      Task.find({ userId }),
      Habit.find({ userId, isActive: true }),
      StudySession.find({
        userId,
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }).sort({ date: 1 }),
      Subject.find({ userId }),
      Expense.find({ userId }),
    ]);

    // 2. Task metrics
    let completedTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;

    tasks.forEach((t) => {
      if (t.status === 'completed') completedTasks++;
      else if (t.status === 'in_progress') inProgressTasks++;
      else pendingTasks++;

      if (t.isOverdue) overdueTasks++;
    });

    const totalTasks = tasks.length;
    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 3. 7-Day Focus Study Trend
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const focusTrend7Days = [];
    let total7DayFocusMins = 0;
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i, 0, 0, 0, 0));
      const dStr = d.toISOString().split('T')[0];
      const daySessions = studySessions.filter((s) => {
        const sDate = new Date(s.date).toISOString().split('T')[0];
        return sDate === dStr;
      });

      const mins = daySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      total7DayFocusMins += mins;

      focusTrend7Days.push({
        date: dStr,
        day: dayNames[d.getUTCDay()],
        focusMinutes: mins,
        focusHours: Number((mins / 60).toFixed(1)),
        sessionsCount: daySessions.length,
      });
    }

    // 4. Habit Consistency
    let totalHabitStreaks = 0;
    const habitStats = habits.map((h) => {
      totalHabitStreaks += h.currentStreak || 0;
      return {
        habitId: h._id,
        name: h.name,
        currentStreak: h.currentStreak,
        longestStreak: h.longestStreak,
        category: h.category,
      };
    });

    const avgStreak = habits.length > 0 ? Math.round(totalHabitStreaks / habits.length) : 0;

    // 5. Composite Productivity Score (0 to 100%)
    // 40% task rate, 30% habit consistency, 30% focus hours
    const taskScore = taskCompletionRate * 0.4;
    const habitScore = Math.min(100, avgStreak * 20) * 0.3;
    const focusScore = Math.min(100, (total7DayFocusMins / (7 * 120)) * 100) * 0.3; // 2 hrs/day target

    const productivityScore = Math.min(100, Math.round(taskScore + habitScore + focusScore));

    let scoreGrade = 'B (Solid Progress)';
    if (productivityScore >= 90) scoreGrade = 'A+ (Peak Flow State)';
    else if (productivityScore >= 75) scoreGrade = 'A (High Velocity)';
    else if (productivityScore >= 60) scoreGrade = 'B (Consistent)';
    else if (productivityScore >= 40) scoreGrade = 'C (Building Momentum)';
    else scoreGrade = 'D (Needs Focus)';

    // 6. Context-Aware AI Daily Summary Generator
    let aiSummary = `You have completed ${completedTasks} of ${totalTasks} deliverables with a ${taskCompletionRate}% completion rate. `;
    if (total7DayFocusMins > 0) {
      aiSummary += `Over the last 7 days, you dedicated ${(total7DayFocusMins / 60).toFixed(1)} hours to focused study. `;
    } else {
      aiSummary += `Use the Focus Timer today to build study momentum on your course subjects. `;
    }

    if (habits.length > 0 && avgStreak > 0) {
      aiSummary += `Your daily habits are performing steadily with an average streak of ${avgStreak} days. `;
    }

    const pendingFees = expenses.filter((e) => e.isCollegeFee && e.status !== 'paid');
    if (pendingFees.length > 0) {
      aiSummary += `Note: You have ${pendingFees.length} pending college fee challan(s) due soon.`;
    }

    return {
      productivityScore,
      scoreGrade,
      taskMetrics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        taskCompletionRate,
      },
      focusTrend7Days,
      total7DayFocusHours: Number((total7DayFocusMins / 60).toFixed(1)),
      habitStats,
      avgStreak,
      subjectsCount: subjects.length,
      aiSummary,
    };
  }
}

module.exports = new AnalyticsService();
