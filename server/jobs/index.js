const cron = require('node-cron');
const Schedule = require('../models/Schedule');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const Expense = require('../models/Expense');
const Subject = require('../models/Subject');
const notificationService = require('../services/notification.service');
const { timeToMinutes, normalizeDate } = require('../utils/timeUtils');

/**
 * Background Cron Job Runner for Mind Tonic
 */
class JobManager {
  initJobs() {
    console.log('⏰ Initializing Mind Tonic background cron jobs...');

    // 1. Task & Schedule Reminder Job: Runs every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.runReminderScan();
    });

    // 2. Evening Habit Streak Warning: Runs every day at 20:00 (8:00 PM)
    cron.schedule('0 20 * * *', async () => {
      await this.runStreakWarningScan();
    });

    // 3. College Fee & Bill Due Date Alert: Runs daily at 09:00 AM
    cron.schedule('0 9 * * *', async () => {
      await this.runFeeDueScan();
    });

    console.log('✓ Background cron jobs active (Reminders */15m, Habit Streaks 20:00, Fee Dues 09:00)');
  }

  /**
   * Scan schedules and alert users about upcoming blocks in the next 30 minutes
   */
  async runReminderScan() {
    try {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const todayStr = now.toISOString().split('T')[0];

      const schedules = await Schedule.find({ date: todayStr });

      for (const sched of schedules) {
        for (const block of sched.blocks) {
          if (block.status !== 'scheduled' || block.type === 'sleep') continue;

          const sMins = timeToMinutes(block.startTime);
          const diff = sMins - currentMins;

          // If block starts in 5 to 25 minutes
          if (diff >= 5 && diff <= 25) {
            // Check if reminder was already sent today
            const exists = await notificationService.getNotifications(sched.userId, {
              limit: 5,
            });
            const alreadySent = exists.some(
              (n) =>
                n.type === 'reminder' &&
                n.metadata?.blockId === block._id.toString()
            );

            if (!alreadySent) {
              await notificationService.createNotification(sched.userId, {
                title: `Upcoming: ${block.title}`,
                message: `Your ${block.type === 'fixed' ? 'fixed commitment' : 'study session'} starts at ${block.startTime} (in ${diff} mins).`,
                type: 'reminder',
                priority: block.type === 'fixed' ? 'high' : 'medium',
                link: '/app/routine',
                metadata: { blockId: block._id.toString(), startTime: block.startTime },
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Reminder scan job error:', err.message);
    }
  }

  /**
   * Alert users with active streaks who haven't logged today
   */
  async runStreakWarningScan() {
    try {
      const today = normalizeDate(new Date());
      const habits = await Habit.find({ isActive: true, currentStreak: { $gte: 2 } });

      for (const habit of habits) {
        const loggedToday = await HabitLog.findOne({
          habitId: habit._id,
          date: today,
        });

        if (!loggedToday) {
          await notificationService.createNotification(habit.userId, {
            title: `Keep Your ${habit.currentStreak}-Day Streak Alive! 🔥`,
            message: `You haven't checked in on "${habit.name}" today. Complete it before midnight to keep your streak!`,
            type: 'streak_warning',
            priority: 'high',
            link: '/app/habits',
            metadata: { habitId: habit._id.toString() },
          });
        }
      }
    } catch (err) {
      console.warn('Streak warning job error:', err.message);
    }
  }

  /**
   * Alert users about pending college fees or bills due in <= 3 days
   */
  async runFeeDueScan() {
    try {
      const now = new Date();
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const dueExpenses = await Expense.find({
        status: { $in: ['pending', 'due_soon'] },
        dueDate: { $lte: threeDaysLater, $gte: now },
      });

      for (const exp of dueExpenses) {
        await notificationService.createNotification(exp.userId, {
          title: `Fee Due Alert: ${exp.title}`,
          message: `Amount ₹${exp.amount.toLocaleString()} is due on ${new Date(exp.dueDate).toLocaleDateString()}.`,
          type: 'fee_due',
          priority: 'high',
          link: '/app/expenses',
          metadata: { expenseId: exp._id.toString() },
        });
      }
    } catch (err) {
      console.warn('Fee due job error:', err.message);
    }
  }
}

module.exports = new JobManager();
