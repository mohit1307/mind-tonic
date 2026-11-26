import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import taskService from '../services/taskService';
import scheduleService from '../services/scheduleService';
import habitService from '../services/habitService';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ScheduleBlockCard from '../components/routine/ScheduleBlockCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [habitStats, setHabitStats] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsData, scheduleData, habitData] = await Promise.all([
        taskService.getStats(),
        scheduleService.getScheduleByDate(new Date()),
        habitService.getStats(),
      ]);
      setStats(statsData);
      setTodaySchedule(scheduleData);
      setHabitStats(habitData);
    } catch (err) {
      console.warn('Dashboard data fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleGenerateToday = async () => {
    setGenerating(true);
    try {
      const updated = await scheduleService.generateSchedule({
        date: new Date().toISOString(),
      });
      setTodaySchedule(updated);
    } catch (err) {
      console.error('Failed to generate today:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleBlockStatus = async (blockId, status) => {
    try {
      await scheduleService.updateBlock(new Date(), blockId, { status });
      loadDashboardData();
    } catch (err) {
      console.error('Failed to update block:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden glass-card p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-accent-500/10 via-secondary-500/10 to-transparent">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 text-xs font-semibold border border-accent-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              AI Intelligent Day Planner
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to win the day, {user?.name?.split(' ')[0] || 'there'}?
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Your preferred working window is{' '}
              <span className="text-slate-200 font-medium">
                {user?.preferences?.workingHoursStart || '09:00'} - {user?.preferences?.workingHoursEnd || '22:00'}
              </span>
              . Mind Tonic adapts your timetable around fixed commitments and study goals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/app/routine">
              <Button icon={Calendar} size="md">
                View Timetable
              </Button>
            </Link>
            <Link to="/app/habits">
              <Button variant="secondary" icon={Plus} size="md">
                Habit Check-in
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-secondary-500/10 text-secondary-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {stats ? stats.pending : 0}
            </span>
            <span className="text-xs text-slate-400">of {stats ? stats.total : 0} total</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            {stats?.overdue > 0 ? (
              <span className="text-danger-400 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3 h-3" /> {stats.overdue} overdue tasks
              </span>
            ) : (
              'All tasks are currently on schedule'
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Today</span>
            <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {todaySchedule?.blocks?.length || 0}
            </span>
            <span className="text-xs text-slate-400">time blocks</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            {todaySchedule?.blocks?.length > 0 ? 'Optimal timetable active' : 'Timetable not generated'}
          </div>
        </Card>

        {/* Live Habit Streak Metric */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Best Habit Streak</span>
            <div className="p-2 rounded-xl bg-warning-500/10 text-warning-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {habitStats ? `${habitStats.bestStreak} Days` : '0 Days'}
            </span>
            <Badge color="warning" size="sm">
              {habitStats ? `${habitStats.todayRate}% Today` : 'Active'}
            </Badge>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            {habitStats?.totalHabits ? `${habitStats.todayCompleted} of ${habitStats.totalHabits} done today` : 'Track habits daily'}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Productivity Score</span>
            <div className="p-2 rounded-xl bg-success-500/10 text-success-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {stats && stats.total > 0 ? `${stats.completionRate}%` : '100%'}
            </span>
            <span className="text-xs text-success-400 font-medium">Optimal</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Daily balance indicator
          </div>
        </Card>
      </div>

      {/* Main Grid: Today's Routine Preview & AI Quick Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle icon={Clock}>Today's Routine Timeline</CardTitle>
              <Link to="/app/routine" className="text-xs text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1">
                Full Routine & Timetable <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading your timeline...</div>
            ) : !todaySchedule?.blocks || todaySchedule.blocks.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-light/60 flex items-center justify-center mx-auto text-slate-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">No events scheduled for today yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click below to generate a conflict-free timetable fitting your pending tasks and fixed commitments.
                </p>
                <Button
                  onClick={handleGenerateToday}
                  loading={generating}
                  size="sm"
                  icon={Sparkles}
                >
                  Generate Daily Timetable
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedule.blocks.slice(0, 5).map((block) => (
                  <ScheduleBlockCard
                    key={block._id || `${block.startTime}-${block.title}`}
                    block={block}
                    onStatusChange={handleBlockStatus}
                    onDelete={() => {}}
                  />
                ))}
                {todaySchedule.blocks.length > 5 && (
                  <div className="pt-2 text-center">
                    <Link to="/app/routine" className="text-xs text-slate-400 hover:text-white">
                      + {todaySchedule.blocks.length - 5} more blocks in full schedule
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* AI Quick Assistant Card */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-b from-accent-500/10 to-transparent border-accent-500/20">
            <CardHeader>
              <CardTitle icon={Sparkles}>AI Assistant Insights</CardTitle>
              <Badge color="accent" size="sm">Active</Badge>
            </CardHeader>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                "Hi {user?.name?.split(' ')[0] || 'there'}! Tell me about your day anytime — e.g. 'I have college from 9 AM to 4 PM, want to study Java for 2 hours, and hit the gym.' I'll build your schedule seamlessly."
              </p>

              <div className="pt-2">
                <Link to="/app/assistant">
                  <Button size="sm" className="w-full" icon={Sparkles}>
                    Chat with Assistant
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
