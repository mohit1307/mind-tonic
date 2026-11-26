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
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function Dashboard() {
  const { user } = useAuth();

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
              Your working hours are set to{' '}
              <span className="text-slate-200 font-medium">
                {user?.preferences?.workingHoursStart || '09:00'} - {user?.preferences?.workingHoursEnd || '22:00'}
              </span>
              . Mind Tonic will keep your schedule organized and adapt to changes.
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Tasks</span>
            <div className="p-2 rounded-xl bg-secondary-500/10 text-secondary-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">0</span>
            <span className="text-xs text-slate-400">for today</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Click 'Add Task' to plan your workload
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
            <Badge color="warning" size="sm">New</Badge>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Build consistency every single day
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Sessions</span>
            <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">0.0 hrs</span>
            <span className="text-xs text-slate-400">logged</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Spaced repetition ready
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
            <span className="text-2xl font-bold text-white">100%</span>
            <span className="text-xs text-success-400 font-medium">Optimal</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Timetable ready to optimize
          </div>
        </Card>
      </div>

      {/* Main Grid: Today's Routine Preview & Quick Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetable / Routine quick card */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle icon={Clock}>Today's Routine Timeline</CardTitle>
              <Link to="/app/routine" className="text-xs text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1">
                Full Schedule <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-light/60 flex items-center justify-center mx-auto text-slate-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">No events scheduled for today yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Generate your personalized daily timetable automatically or add fixed commitments like classes and work.
              </p>
              <Link to="/app/routine" className="inline-block mt-2">
                <Button size="sm" variant="outline">
                  Configure Routine
                </Button>
              </Link>
            </div>
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
                "Hi {user?.name?.split(' ')[0] || 'there'}! Tell me about your day anytime — e.g. 'I have classes from 9 to 4 and want to study Java for 2 hours.' I'll build your schedule seamlessly."
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
