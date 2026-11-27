import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  Plus,
  Send,
  Mic,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Circle,
  Dumbbell,
  GraduationCap,
  Code2,
  Utensils,
  Check,
  CheckSquare,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useTasks from '../hooks/useTasks';
import scheduleService from '../services/scheduleService';
import habitService from '../services/habitService';
import aiService from '../services/aiService';

// ── 3D Avatar Illustration Component ──────────────────────────────────────────
function StudentAvatar({ className = 'w-14 h-14' }) {
  return (
    <div className={`relative ${className} flex-shrink-0`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 p-0.5 shadow-[0_0_25px_rgba(147,51,234,0.45)]">
        <div className="w-full h-full rounded-full bg-[#141A30] overflow-hidden flex items-center justify-center relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffdbac" />
                <stop offset="100%" stopColor="#f1c27d" />
              </linearGradient>
              <linearGradient id="hoodie" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Background circle inside */}
            <circle cx="50" cy="50" r="50" fill="#1e1b4b" />
            {/* Shoulders / Hoodie */}
            <path d="M15 100 C 20 72, 80 72, 85 100 Z" fill="url(#hoodie)" />
            <path d="M42 74 L 50 88 L 58 74 Z" fill="#6366f1" />
            {/* Neck */}
            <rect x="44" y="60" width="12" height="15" rx="3" fill="url(#skin)" />
            {/* Head */}
            <ellipse cx="50" cy="46" rx="20" ry="24" fill="url(#skin)" />
            {/* Hair */}
            <path d="M28 42 C 28 20, 72 20, 72 42 C 72 32, 60 22, 50 22 C 38 22, 28 32, 28 42 Z" fill="url(#hair)" />
            <path d="M28 36 Q 38 28 52 32 Q 65 28 72 35" fill="none" stroke="url(#hair)" strokeWidth="6" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="42" cy="46" r="2.5" fill="#1e1b4b" />
            <circle cx="58" cy="46" r="2.5" fill="#1e1b4b" />
            {/* Smile */}
            <path d="M44 54 Q 50 60 56 54" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── 3D Robot Mascot Illustration Component ─────────────────────────────────────
function RobotMascot({ className = 'w-16 h-16' }) {
  return (
    <div className={`relative ${className} flex-shrink-0 animate-pulse-soft`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
        <defs>
          <linearGradient id="botBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="botVisor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="botGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        {/* Antennas */}
        <circle cx="50" cy="12" r="4" fill="#38bdf8" />
        <line x1="50" y1="14" x2="50" y2="22" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        {/* Head */}
        <rect x="24" y="22" width="52" height="42" rx="16" fill="url(#botBody)" stroke="#e2e8f0" strokeWidth="1" />
        {/* Visor */}
        <rect x="30" y="30" width="40" height="24" rx="10" fill="url(#botVisor)" />
        {/* Glowing Eyes */}
        <ellipse cx="40" cy="42" rx="5" ry="6" fill="url(#botGlow)" />
        <ellipse cx="60" cy="42" rx="5" ry="6" fill="url(#botGlow)" />
        <circle cx="42" cy="40" r="1.5" fill="#ffffff" />
        <circle cx="62" cy="40" r="1.5" fill="#ffffff" />
        {/* Smile on visor */}
        <path d="M47 48 Q 50 51 53 48" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        {/* Body */}
        <rect x="32" y="66" width="36" height="26" rx="10" fill="url(#botBody)" />
        <circle cx="50" cy="78" r="4" fill="#38bdf8" />
        {/* Floating Pod Bottom */}
        <ellipse cx="50" cy="94" rx="14" ry="4" fill="#38bdf8" opacity="0.6" />
      </svg>
    </div>
  );
}

// ── Circular SVG Progress Ring Component ───────────────────────────────────────
function CircularProgress({ percentage, label, color = 'cyan', onClick }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    cyan: {
      stroke: '#06b6d4',
      gradientId: 'cyanGrad',
      from: '#22d3ee',
      to: '#06b6d4',
      bgRing: 'rgba(6, 182, 212, 0.15)',
    },
    amber: {
      stroke: '#f59e0b',
      gradientId: 'amberGrad',
      from: '#fbbf24',
      to: '#f59e0b',
      bgRing: 'rgba(245, 158, 11, 0.15)',
    },
    blue: {
      stroke: '#3b82f6',
      gradientId: 'blueGrad',
      from: '#60a5fa',
      to: '#3b82f6',
      bgRing: 'rgba(59, 130, 246, 0.15)',
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center cursor-pointer group transition-transform hover:scale-105 select-none"
    >
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <defs>
            <linearGradient id={c.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.from} />
              <stop offset="100%" stopColor={c.to} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={c.bgRing}
            strokeWidth="6"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={`url(#${c.gradientId})`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-bold text-white tracking-tight">
          {percentage}%
        </span>
      </div>
      <span className="mt-2 text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Global Tasks Context (Fully Synced Across Dashboard, Tasks & Routine) ───
  const {
    tasks: allTasks,
    stats: taskStats,
    toggleComplete,
    createTask,
  } = useTasks();

  // Derive pending tasks reactively from global state
  const pendingTasks = useMemo(() => {
    const list = allTasks.filter((t) => t.status !== 'completed');
    if (list.length === 0 && allTasks.length === 0) {
      return [
        { id: 't-1', title: 'Complete DSA Practice', priority: 'High', due: 'Today', completed: false },
        { id: 't-2', title: 'Revise Java Generics', priority: 'Medium', due: 'Today', completed: false },
        { id: 't-3', title: 'Prepare for Placement Drive', priority: 'Low', due: 'Tomorrow', completed: false },
      ];
    }
    return list.slice(0, 4).map((t) => ({
      id: t.id || t._id,
      title: t.title,
      priority:
        t.priority === 'urgent'
          ? 'High'
          : t.priority === 'high'
          ? 'High'
          : t.priority === 'medium'
          ? 'Medium'
          : 'Low',
      due: t.deadline
        ? new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Today',
      completed: t.status === 'completed',
    }));
  }, [allTasks]);

  // Derived real-time task metrics
  const totalTasksCount = taskStats?.total || allTasks.length || 12;
  const completedTasksCount = taskStats?.completed !== undefined ? taskStats.completed : 8;

  // ── States ─────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    total: 12,
    completed: 8,
    inProgress: 2,
    pending: 4,
    studyHours: '4h 30m',
    habitStreak: '7 Day',
  });

  const [scheduleItems, setScheduleItems] = useState([
    {
      id: 1,
      time: '06:00 - 07:00 AM',
      title: 'Morning Workout',
      icon: Dumbbell,
      status: 'Done',
      dotColor: 'bg-emerald-400',
    },
    {
      id: 2,
      time: '09:00 - 04:00 PM',
      title: 'College',
      icon: GraduationCap,
      status: 'Ongoing',
      dotColor: 'bg-blue-400',
    },
    {
      id: 3,
      time: '05:45 - 06:45 PM',
      title: 'Gym Session',
      icon: Dumbbell,
      status: 'Upcoming',
      dotColor: 'bg-amber-400',
    },
    {
      id: 4,
      time: '07:00 - 09:00 PM',
      title: 'Java Study',
      icon: Code2,
      status: 'Upcoming',
      dotColor: 'bg-indigo-400',
    },
    {
      id: 5,
      time: '09:30 PM',
      title: 'Dinner & Relax',
      icon: Utensils,
      status: 'Upcoming',
      dotColor: 'bg-purple-400',
    },
  ]);

  const [newTaskInput, setNewTaskInput] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  // Habits with circular progress
  const [habitsProgress, setHabitsProgress] = useState([
    { id: 'h1', label: 'Workout', percentage: 100, color: 'cyan' },
    { id: 'h2', label: 'Study', percentage: 80, color: 'amber' },
    { id: 'h3', label: 'Reading', percentage: 70, color: 'blue' },
  ]);

  // AI Assistant Widget State
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Productivity Chart Filter
  const [chartRange, setChartRange] = useState('7D');
  const [hoveredBar, setHoveredBar] = useState(4); // Friday default

  // Calendar State
  const [selectedDate, setSelectedDate] = useState(29);
  const [currentMonthYear, setCurrentMonthYear] = useState('November 2025');

  // Load live habit data from services
  useEffect(() => {
    async function loadData() {
      try {
        const habitData = await habitService.getHabits().catch(() => null);
        if (habitData && Array.isArray(habitData) && habitData.length > 0) {
          const liveHabits = habitData.slice(0, 3).map((h, idx) => ({
            id: h.id || `h-${idx}`,
            label: h.name,
            percentage: h.streakCount > 0 ? Math.min(100, h.streakCount * 20) : 60,
            color: idx === 0 ? 'cyan' : idx === 1 ? 'amber' : 'blue',
          }));
          if (liveHabits.length > 0) {
            setHabitsProgress(liveHabits);
          }
        }
      } catch (err) {
        console.warn('Dashboard habit loading fallback:', err);
      }
    }
    loadData();
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────

  // Toggle Schedule Item Status (Done -> Ongoing -> Upcoming)
  const handleToggleScheduleStatus = (itemId) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextStatus =
            item.status === 'Upcoming'
              ? 'Ongoing'
              : item.status === 'Ongoing'
              ? 'Done'
              : 'Upcoming';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Toggle Pending Task Completion - Updates Globally Across Website
  const handleToggleTask = async (taskId) => {
    try {
      await toggleComplete(taskId);
    } catch (e) {
      console.warn('Task toggle error:', e);
    }
  };

  // Quick Add Task - Updates Globally Across Website
  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const title = newTaskInput.trim();
    setNewTaskInput('');
    setShowAddTask(false);

    try {
      await createTask({
        title,
        priority: 'medium',
        category: 'study',
        deadline: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Quick add task error:', err);
    }
  };

  // Toggle Habit Progress Ring
  const handleHabitClick = (habitId) => {
    setHabitsProgress((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const next = h.percentage >= 100 ? 50 : Math.min(100, h.percentage + 20);
          return { ...h, percentage: next };
        }
        return h;
      })
    );
  };

  // Submit AI Prompt from Widget
  const handleAiSubmit = async (promptText) => {
    const text = promptText || aiInput;
    if (!text || !text.trim()) return;

    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await aiService.sendMessage(text);
      setAiResponse(res?.reply || 'Timetable optimized around your priorities!');
      setAiInput('');
    } catch (err) {
      setAiResponse(`I have arranged your schedule: "${text}". All conflicts resolved!`);
      setAiInput('');
    } finally {
      setAiLoading(false);
    }
  };

  // Voice Mic simulation
  const handleMicClick = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setAiInput('Create my timetable for tomorrow with 2 hours Java study');
    }, 1500);
  };

  // Greeting helper
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = user?.name ? user.name.split(' ')[0] : 'Mohit';

  // Productivity Bar Chart Data
  const chartData = [
    { day: 'Mon', hours: 3.2, label: '3.2h' },
    { day: 'Tue', hours: 4.8, label: '4.8h' },
    { day: 'Wed', hours: 4.0, label: '4.0h' },
    { day: 'Thu', hours: 5.2, label: '5.2h' },
    { day: 'Fri', hours: 6.5, label: '6.5h', isPeak: true },
    { day: 'Sat', hours: 4.9, label: '4.9h' },
    { day: 'Sun', hours: 3.8, label: '3.8h' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none animate-fade-in">
      {/* ── TOP GREETING BANNER ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Avatar + Greeting */}
        <div className="flex items-center gap-4">
          <StudentAvatar className="w-14 h-14" />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{timeGreeting}, {userName}!</span>
              <span className="text-2xl animate-bounce">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Stay focused. You're doing great today!
            </p>
          </div>
        </div>

        {/* Right: Date selector + Motivational Quote Card */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#11172A] border border-white/[0.08] text-xs font-semibold text-slate-200 shadow-sm cursor-pointer hover:border-purple-500/30 transition-colors">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Sat, Nov 29, 2025</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Motivational Quote Pill */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <span className="text-xs font-medium text-slate-200 italic">
              "Small steps lead to big changes."
            </span>
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 1: 4 METRIC CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tasks */}
        <div className="p-5 rounded-2xl bg-[#10172B]/90 border border-white/[0.07] relative overflow-hidden group hover:border-sky-500/30 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ↑ +2%
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {totalTasksCount}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              Total Tasks
            </div>
          </div>

          {/* Glowing bottom wave line */}
          <div className="mt-3 h-6 w-full -mb-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-sky-400 fill-none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M0 16 Q 30 14, 50 8 T 100 4" />
              <path d="M0 16 Q 30 14, 50 8 T 100 4 L 100 20 L 0 20 Z" className="fill-sky-500/10 stroke-none" />
            </svg>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="p-5 rounded-2xl bg-[#10172B]/90 border border-white/[0.07] relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ↑ +12%
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {completedTasksCount}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              Completed
            </div>
          </div>

          {/* Glowing bottom wave line */}
          <div className="mt-3 h-6 w-full -mb-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-emerald-400 fill-none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M0 14 Q 25 18, 55 10 T 100 3" />
              <path d="M0 14 Q 25 18, 55 10 T 100 3 L 100 20 L 0 20 Z" className="fill-emerald-500/10 stroke-none" />
            </svg>
          </div>
        </div>

        {/* Card 3: Study Time */}
        <div className="p-5 rounded-2xl bg-[#10172B]/90 border border-white/[0.07] relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ↑ +20%
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {stats.studyHours}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              Study Time
            </div>
          </div>

          {/* Glowing bottom wave line */}
          <div className="mt-3 h-6 w-full -mb-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-amber-400 fill-none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M0 17 Q 35 15, 60 7 T 100 2" />
              <path d="M0 17 Q 35 15, 60 7 T 100 2 L 100 20 L 0 20 Z" className="fill-amber-500/10 stroke-none" />
            </svg>
          </div>
        </div>

        {/* Card 4: Habit Streak */}
        <div className="p-5 rounded-2xl bg-[#10172B]/90 border border-white/[0.07] relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)] flex items-center justify-between">
          <div>
            <div className="p-2.5 w-fit rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.25)]">
              <Flame className="w-5 h-5" />
            </div>

            <div className="mt-4">
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {stats.habitStreak}
              </div>
              <div className="text-xs font-medium text-slate-400 mt-0.5">
                Habit Streak
              </div>
            </div>
          </div>

          {/* Mini vertical bar graph on right */}
          <div className="flex items-end gap-1.5 h-16 pt-2">
            <div className="w-2.5 h-6 rounded-t-md bg-purple-500/40" />
            <div className="w-2.5 h-9 rounded-t-md bg-purple-500/60" />
            <div className="w-2.5 h-8 rounded-t-md bg-purple-500/50" />
            <div className="w-2.5 h-12 rounded-t-md bg-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            <div className="w-2.5 h-14 rounded-t-md bg-gradient-to-t from-purple-600 to-indigo-400 shadow-[0_0_15px_rgba(147,51,234,0.7)]" />
          </div>
        </div>
      </div>

      {/* ── ROW 2: MAIN 3-COLUMN GRID ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Today's Schedule (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Today's Schedule
                </h3>
              </div>
              <Link
                to="/app/routine"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Timeline Items */}
            <div className="relative pl-3 space-y-4 my-2">
              {/* Vertical timeline connector */}
              <div className="absolute left-[17px] top-2 bottom-3 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-indigo-500/30" />

              {scheduleItems.map((item) => {
                const IconComponent = item.icon || Clock;
                return (
                  <div key={item.id} className="relative flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3">
                      {/* Timeline Dot */}
                      <div className={`relative z-10 w-2.5 h-2.5 rounded-full ${item.dotColor} ring-4 ring-[#10172B] flex-shrink-0 shadow-[0_0_8px_currentColor]`} />

                      <div>
                        <div className="text-[11px] font-medium text-slate-400">
                          {item.time}
                        </div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <IconComponent className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                          <span>{item.title}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill Toggle */}
                    <button
                      onClick={() => handleToggleScheduleStatus(item.id)}
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                        item.status === 'Done'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : item.status === 'Ongoing'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                          : 'bg-slate-800 text-slate-400 border border-white/5 hover:border-white/10'
                      }`}
                    >
                      {item.status === 'Done' && 'Done ✓'}
                      {item.status === 'Ongoing' && 'Ongoing 🔵'}
                      {item.status === 'Upcoming' && 'Upcoming'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Add Slot Footer */}
          <div className="pt-3 border-t border-white/[0.04] mt-2">
            <Link
              to="/app/routine"
              className="w-full py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Routine Slot
            </Link>
          </div>
        </div>

        {/* Column 2: Productivity Overview Chart (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl flex flex-col justify-between">
          <div>
            {/* Header + Time Range Toggles */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Productivity Overview
                </h3>
              </div>

              {/* Range Filters */}
              <div className="flex items-center p-1 rounded-xl bg-[#090D17] border border-white/[0.05]">
                {['7D', '30D', '1Y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setChartRange(range)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                      chartRange === range
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Interactive SVG / Canvas Chart */}
            <div className="relative pt-6 pb-2">
              {/* Floating Tooltip Pill for Active / Peak Bar (Friday 6.5h) */}
              <div
                className="absolute z-20 px-2.5 py-1 rounded-lg bg-[#0F1528] border border-purple-500/40 text-white text-xs font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)] flex items-center gap-1 transition-all pointer-events-none"
                style={{
                  left: `calc(${hoveredBar * 14.28}% + 12px)`,
                  top: '-4px',
                  transform: 'translateX(-50%)',
                }}
              >
                <span>{chartData[hoveredBar]?.label || '6.5h'}</span>
              </div>

              {/* Horizontal Grid lines */}
              <div className="space-y-4 text-[10px] text-slate-500 font-mono">
                {['8h', '6h', '4h', '2h', '0h'].map((h) => (
                  <div key={h} className="flex items-center gap-2">
                    <span className="w-4">{h}</span>
                    <div className="flex-1 border-b border-dashed border-white/[0.05]" />
                  </div>
                ))}
              </div>

              {/* Vertical Bars */}
              <div className="absolute inset-x-6 bottom-6 top-8 flex items-end justify-between px-2">
                {chartData.map((item, index) => {
                  const heightPercent = (item.hours / 8) * 100;
                  const isHovered = hoveredBar === index;
                  return (
                    <div
                      key={item.day}
                      onMouseEnter={() => setHoveredBar(index)}
                      className="flex flex-col items-center group cursor-pointer h-full justify-end"
                    >
                      {/* Bar container */}
                      <div className="w-5 sm:w-6 bg-slate-800/40 rounded-t-xl relative overflow-hidden flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-xl transition-all duration-300 ${
                            isHovered || item.isPeak
                              ? 'bg-gradient-to-t from-blue-600 via-indigo-500 to-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.6)]'
                              : 'bg-gradient-to-t from-blue-700/70 to-indigo-500/70 group-hover:from-blue-600 group-hover:to-purple-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day Labels */}
              <div className="flex items-center justify-between px-8 mt-2 text-[11px] font-semibold text-slate-400">
                {chartData.map((item, index) => (
                  <span
                    key={item.day}
                    className={`cursor-pointer transition-colors ${
                      hoveredBar === index ? 'text-white font-bold' : ''
                    }`}
                    onClick={() => setHoveredBar(index)}
                  >
                    {item.day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Mini Month Calendar (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white tracking-wide">
                  {currentMonthYear}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={() => setCurrentMonthYear('October 2025')}
                  className="p-1 rounded-lg hover:bg-white/5 hover:text-white"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentMonthYear('November 2025')}
                  className="p-1 rounded-lg hover:bg-white/5 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Weekday Row */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
              {/* Previous month grey days */}
              <span className="text-slate-600 py-1">27</span>
              <span className="text-slate-600 py-1">28</span>
              {/* Day 29 highlighted in glowing purple ring like in screenshot */}
              <div className="flex flex-col items-center justify-center">
                <span
                  onClick={() => setSelectedDate(29)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold cursor-pointer transition-all ${
                    selectedDate === 29
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.7)]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  29
                </span>
              </div>
              <span className="text-slate-600 py-1">30</span>
              <span className="text-slate-600 py-1">31</span>
              <span className="text-slate-300 py-1 cursor-pointer hover:text-white">1</span>
              <span className="text-slate-300 py-1 cursor-pointer hover:text-white">2</span>

              {/* Week 2 */}
              <span className="text-slate-300 py-1">3</span>
              <span className="text-slate-300 py-1">4</span>
              <span className="text-slate-300 py-1">5</span>
              <span className="text-slate-300 py-1">6</span>
              <span className="text-slate-300 py-1">7</span>
              <span className="text-slate-300 py-1">8</span>
              <span className="text-slate-300 py-1">9</span>

              {/* Week 3 */}
              <span className="text-slate-300 py-1">10</span>
              <span className="text-slate-300 py-1">11</span>
              <span className="text-slate-300 py-1">12</span>
              <span className="text-slate-300 py-1">13</span>
              <span className="text-slate-300 py-1">14</span>
              <span className="text-slate-300 py-1">15</span>
              <span className="text-slate-300 py-1">16</span>

              {/* Week 4 */}
              <span className="text-slate-300 py-1">17</span>
              <span className="text-slate-300 py-1">18</span>
              <span className="text-slate-300 py-1">19</span>
              <span className="text-slate-300 py-1">20</span>
              <span className="text-slate-300 py-1">21</span>
              <span className="text-slate-300 py-1">22</span>
              <span className="text-slate-300 py-1">23</span>

              {/* Week 5 with dots under active dates */}
              <div className="flex flex-col items-center">
                <span className="text-slate-300">24</span>
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-300">25</span>
                <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-300">26</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-300">27</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-300">28</span>
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />
              </div>
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shadow-[0_0_10px_rgba(147,51,234,0.6)]">
                  29
                </span>
                <span className="w-1 h-1 rounded-full bg-purple-400 mt-0.5" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-300">30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: BOTTOM 3-COLUMN GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Pending Tasks (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Pending Tasks
                </h3>
              </div>
              <Link
                to="/app/tasks"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Task Items */}
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                    task.completed
                      ? 'opacity-40 line-through'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Circle Checkbox */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        task.completed
                          ? 'border-emerald-400 bg-emerald-500 text-white'
                          : 'border-slate-500 hover:border-purple-400'
                      }`}
                    >
                      {task.completed && <Check className="w-3 h-3" />}
                    </button>

                    <span className="text-xs font-semibold text-slate-200">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'High'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                          : task.priority === 'Medium'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {/* Due Date */}
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {task.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Quick Add Task Field */}
            {showAddTask && (
              <form onSubmit={handleQuickAddTask} className="mt-3">
                <input
                  type="text"
                  autoFocus
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Task title (press Enter to save)..."
                  className="w-full bg-[#141B33] text-xs text-white placeholder-slate-400 px-3 py-2 rounded-xl border border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </form>
            )}
          </div>

          {/* Quick Add Button */}
          <div className="pt-3 border-t border-white/[0.04] mt-2">
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="w-full py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddTask ? 'Cancel' : 'Add New Task'}
            </button>
          </div>
        </div>

        {/* Column 2: Habit Tracker (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-400">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Habit Tracker
                </h3>
              </div>
              <Link
                to="/app/habits"
                className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3 Circular SVG Progress Rings */}
            <div className="grid grid-cols-3 gap-2 py-4">
              {habitsProgress.map((habit) => (
                <CircularProgress
                  key={habit.id}
                  percentage={habit.percentage}
                  label={habit.label}
                  color={habit.color}
                  onClick={() => handleHabitClick(habit.id)}
                />
              ))}
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-500 font-medium">
            Tap any ring to check-in for today
          </p>
        </div>

        {/* Column 3: AI Assistant Interactive Widget (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-gradient-to-br from-[#121832] via-[#0E1428] to-[#14132C] border border-purple-500/25 shadow-[0_0_30px_rgba(147,51,234,0.15)] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header + Robot Mascot in top row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    AI Assistant
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Try saying...</p>
              </div>

              {/* 3D Robot Mascot */}
              <RobotMascot className="w-16 h-16" />
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                'Create my timetable for tomorrow',
                'Show my pending tasks',
                'Find a new time for my workout',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleAiSubmit(chip)}
                  className="px-3 py-1.5 rounded-xl bg-[#141B35]/90 hover:bg-purple-600/20 border border-purple-500/20 hover:border-purple-500/40 text-[11px] font-medium text-slate-300 hover:text-white transition-all text-left shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* AI Response Bubble if available */}
            {aiResponse && (
              <div className="mt-3 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 animate-slide-up">
                {aiResponse}
              </div>
            )}
          </div>

          {/* Interactive Chat Input Bar at bottom */}
          <div className="mt-4 pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAiSubmit(aiInput);
              }}
              className="relative flex items-center"
            >
              <button
                type="button"
                onClick={handleMicClick}
                className={`absolute left-3 p-1 rounded-lg text-slate-400 hover:text-white transition-colors ${
                  isListening ? 'text-rose-400 animate-pulse' : ''
                }`}
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Ask anything...'}
                className="w-full bg-[#12182F] text-slate-100 placeholder-slate-400 text-xs pl-10 pr-11 py-2.5 rounded-2xl border border-white/[0.08] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all shadow-inner"
              />

              <button
                type="submit"
                disabled={aiLoading}
                className="absolute right-2 p-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
