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
  BookOpen,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import taskService from '../services/taskService';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import TaskCard from '../components/tasks/TaskCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, tasksResponse] = await Promise.all([
          taskService.getStats(),
          taskService.getTasks({ limit: 4, status: 'pending' }),
        ]);
        setStats(statsData);
        setRecentTasks(tasksResponse.data || []);
      } catch (err) {
        console.warn('Dashboard data fetch warning:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleToggleComplete = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId);
      // Refresh tasks & stats
      const [statsData, tasksResponse] = await Promise.all([
        taskService.getStats(),
        taskService.getTasks({ limit: 4, status: 'pending' }),
      ]);
      setStats(statsData);
      setRecentTasks(tasksResponse.data || []);
    } catch (err) {
      console.error('Failed to toggle task:', err);
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
              . Mind Tonic will keep your schedule organized and adapt when plans change.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/app/routine">
              <Button icon={Calendar} size="md">
                Generate Today's Routine
              </Button>
            </Link>
            <Link to="/app/tasks">
              <Button variant="secondary" icon={Plus} size="md">
                Add Task
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row (Dynamically populated from live task stats) */}
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
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-success-500/10 text-success-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {stats ? stats.completed : 0}
            </span>
            <Badge color="success" size="sm">
              {stats ? `${stats.completionRate}%` : '0%'}
            </Badge>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Tasks completed successfully
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Habit Streak</span>
            <div className="p-2 rounded-xl bg-warning-500/10 text-warning-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">0 Days</span>
            <Badge color="warning" size="sm">Phase 5</Badge>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Build consistency every single day
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Productivity Score</span>
            <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {stats && stats.total > 0 ? `${stats.completionRate}%` : '100%'}
            </span>
            <span className="text-xs text-accent-400 font-medium">Optimal</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Based on completed deliverables
          </div>
        </Card>
      </div>

      {/* Main Grid: Pending Tasks List & AI Quick Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle icon={Clock}>Pending Deliverables</CardTitle>
              <Link to="/app/tasks" className="text-xs text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1">
                View All Tasks ({stats?.total || 0}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading your tasks...</div>
            ) : recentTasks.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-light/60 flex items-center justify-center mx-auto text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-success-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">No pending tasks right now</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Add college lectures, study goals, or gym sessions to let Mind Tonic schedule your day.
                </p>
                <Link to="/app/tasks" className="inline-block mt-2">
                  <Button size="sm" variant="outline">
                    Add a Task
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onStatusChange={() => {}}
                  />
                ))}
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
                "Hi {user?.name?.split(' ')[0] || 'there'}! Tell me about your day anytime — e.g. 'I have college from 9 AM to 4 PM and want to study Java for 2 hours.' I'll create your schedule and keep tasks balanced."
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
