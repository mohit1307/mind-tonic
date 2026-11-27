const cron = require('node-cron');
const { supabaseDb } = require('../db/supabaseDb');
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

      const { data: schedules } = await supabaseDb.client
        .from('schedules')
        .select('id, user_id, date')
        .eq('date', todayStr);

      if (!schedules || schedules.length === 0) return;

      for (const sched of schedules) {
        const { data: events } = await supabaseDb.client
          .from('schedule_events')
          .select('*')
          .eq('schedule_id', sched.id);

        for (const block of events || []) {
          if (block.status !== 'pending' && block.status !== 'scheduled') continue;
          if (block.type === 'sleep') continue;

          const sMins = timeToMinutes(block.start_time);
          const diff = sMins - currentMins;

          // If block starts in 5 to 25 minutes
          if (diff >= 5 && diff <= 25) {
            const exists = await notificationService.getNotifications(sched.user_id, {
              limit: 5,
            });
            const alreadySent = exists.some(
              (n) => n.type === 'schedule' && n.metadata?.eventId === block.id
            );

            if (!alreadySent) {
              await notificationService.createNotification(sched.user_id, {
                title: `Upcoming: ${block.title}`,
                message: `Your ${block.type === 'fixed' ? 'fixed commitment' : 'scheduled session'} starts at ${block.start_time} (in ${diff} mins).`,
                type: 'schedule',
                priority: block.type === 'fixed' ? 'high' : 'medium',
                link: '/app/routine',
                metadata: { eventId: block.id, startTime: block.start_time },
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Reminder scan job notice:', err.message);
    }
  }

  /**
   * Alert users with active streaks who haven't logged today
   */
  async runStreakWarningScan() {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: habits } = await supabaseDb.client
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .gte('current_streak', 2);

      for (const habit of habits || []) {
        const loggedToday = await supabaseDb.findOne('habit_logs', {
          habit_id: habit.id,
          date: todayStr,
        });

        if (!loggedToday) {
          await notificationService.createNotification(habit.user_id, {
            title: `Keep Your ${habit.current_streak}-Day Streak Alive! 🔥`,
            message: `You haven't checked in on "${habit.name}" today. Complete it before midnight to keep your streak!`,
            type: 'habit',
            priority: 'high',
            link: '/app/habits',
            metadata: { habitId: habit.id },
          });
        }
      }
    } catch (err) {
      console.warn('Streak warning job notice:', err.message);
    }
  }

  /**
   * Alert users about pending college fees or bills due in <= 3 days
   */
  async runFeeDueScan() {
    try {
      const now = new Date();
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const todayStr = now.toISOString().split('T')[0];
      const dueLimitStr = threeDaysLater.toISOString().split('T')[0];

      const { data: dueExpenses } = await supabaseDb.client
        .from('expenses')
        .select('*')
        .neq('status', 'paid')
        .gte('due_date', todayStr)
        .lte('due_date', dueLimitStr);

      for (const exp of dueExpenses || []) {
        await notificationService.createNotification(exp.user_id, {
          title: `Fee Due Alert: ${exp.title}`,
          message: `Amount ₹${Number(exp.amount).toLocaleString()} is due on ${exp.due_date}.`,
          type: 'expense',
          priority: 'high',
          link: '/app/expenses',
          metadata: { expenseId: exp.id },
        });
      }
    } catch (err) {
      console.warn('Fee due job notice:', err.message);
    }
  }
}

module.exports = new JobManager();
