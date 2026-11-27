import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Calendar,
  Star,
  ArrowRight,
  TrendingUp,
  ChevronDown,
  Check,
  Zap,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminDashboard() {
  const [data, setData] = useState({
    metrics: {
      totalUsers: { value: '2.5K', change: '+12%' },
      totalTasks: { value: '18.7K', change: '+8%' },
      activeSchedules: { value: '1.2K', change: '+10%' },
      systemUptime: { value: '95%', change: '+10%' },
    },
    userGrowth: [
      { date: 'Nov 23', users: 1100, label: '1.1K' },
      { date: 'Nov 24', users: 1650, label: '1.6K' },
      { date: 'Nov 25', users: 2050, label: '2.0K' },
      { date: 'Nov 26', users: 2200, label: '2.2K' },
      { date: 'Nov 27', users: 2450, label: '2.4K' },
      { date: 'Nov 28', users: 2700, label: '2.7K' },
      { date: 'Nov 29', users: 2980, label: '3.0K', isPeak: true },
    ],
    topFeatures: {
      timetable: 72,
      tasks: 18,
      habits: 10,
    },
    recentUsers: [
      {
        id: 'u-1',
        name: 'Rohan Kumar',
        initials: 'RK',
        time: '2 min ago',
        color: 'bg-blue-600',
        active: true,
      },
      {
        id: 'u-2',
        name: 'Sneha Patel',
        initials: 'SP',
        time: '5 min ago',
        color: 'bg-purple-600',
        active: true,
      },
      {
        id: 'u-3',
        name: 'Aman Kapoor',
        initials: 'AK',
        time: '8 min ago',
        color: 'bg-slate-700',
        active: true,
      },
    ],
    activityLogs: [
      {
        id: 1,
        title: 'New user registered',
        time: '2 min ago',
        icon: CheckCircle2,
        color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
      },
      {
        id: 2,
        title: 'Schedule created',
        time: '5 min ago',
        icon: Calendar,
        color: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
      },
      {
        id: 3,
        title: 'Expense added',
        time: '8 min ago',
        icon: Receipt,
        color: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
      },
    ],
  });

  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [hoveredGrowthIndex, setHoveredGrowthIndex] = useState(6);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await adminService.getOverview();
        if (res) {
          setData((prev) => ({
            ...prev,
            metrics: res.metrics || prev.metrics,
            userGrowth: res.userGrowth || prev.userGrowth,
            topFeatures: res.topFeatures || prev.topFeatures,
            recentUsers: res.recentUsers
              ? res.recentUsers.map((u, i) => ({
                  ...u,
                  time: u.joinedAt || `${(i + 1) * 3} min ago`,
                  active: true,
                }))
              : prev.recentUsers,
          }));
        }
      } catch (err) {
        console.warn('Admin overview fallback active:', err.message);
      }
    }
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none animate-fade-in">
      {/* ── TOP TITLE & CONTROLS ROW ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Admin Dashboard
          </h1>
          <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mt-1.5 shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
        </div>

        {/* Date Range Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#10172B] border border-white/[0.08] hover:border-purple-500/40 text-xs font-semibold text-slate-200 shadow-sm transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dateDropdownOpen && (
            <div
              onMouseLeave={() => setDateDropdownOpen(false)}
              className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#10172B] border border-white/10 p-1.5 shadow-2xl z-50 animate-slide-up"
            >
              {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'All Time'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setDateRange(r);
                    setDateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                    dateRange === r
                      ? 'bg-purple-600/20 text-purple-300 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 1: 4 METRIC CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="p-5 rounded-2xl bg-[#10172B]/90 border border-white/[0.07] relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.25)]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {data.metrics.totalUsers.change}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {data.metrics.totalUsers.value}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              Total Users
            </div>
          </div>

          {/* Glowing bottom wave line */}
          <div className="mt-3 h-6 w-full -mb-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-purple-400 fill-none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M0 16 Q 25 18, 50 10 T 100 4" />
              <path d="M0 16 Q 25 18, 50 10 T 100 4 L 100 20 L 0 20 Z" className="fill-purple-500/10 stroke-none" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Tasks */}
        <div className="p-5 rounded-2xl bg-[#10172B]/90 border border-white/[0.07] relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {data.metrics.totalTasks.change}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {data.metrics.totalTasks.value}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              Total Tasks
            </div>
          </div>

          {/* Glowing bottom wave line */}
          <div className="mt-3 h-6 w-full -mb-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-emerald-400 fill-none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M0 14 Q 30 16, 55 8 T 100 2" />
              <path d="M0 14 Q 30 16, 55 8 T 100 2 L 100 20 L 0 20 Z" className="fill-emerald-500/10 stroke-none" />
            </svg>
          </div>
        </div>

        {/* Card 3: Active Schedules */}
        <div className="p-5 rounded-2xl bg-[#10172B]/90 border border-white/[0.07] relative overflow-hidden group hover:border-sky-500/40 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {data.metrics.activeSchedules.change}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {data.metrics.activeSchedules.value}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              Active Schedules
            </div>
          </div>

          {/* Glowing bottom wave line */}
          <div className="mt-3 h-6 w-full -mb-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-sky-400 fill-none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M0 16 Q 35 14, 60 7 T 100 3" />
              <path d="M0 16 Q 35 14, 60 7 T 100 3 L 100 20 L 0 20 Z" className="fill-sky-500/10 stroke-none" />
            </svg>
          </div>
        </div>

        {/* Card 4: System Uptime */}
        <div className="p-5 rounded-2xl bg-[#10172B]/90 border border-white/[0.07] relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {data.metrics.systemUptime.change}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {data.metrics.systemUptime.value}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              System Uptime
            </div>
          </div>

          {/* Glowing bottom wave line */}
          <div className="mt-3 h-6 w-full -mb-2">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-amber-400 fill-none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M0 17 Q 30 15, 60 8 T 100 3" />
              <path d="M0 17 Q 30 15, 60 8 T 100 3 L 100 20 L 0 20 Z" className="fill-amber-500/10 stroke-none" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── ROW 2: USER GROWTH & TOP FEATURES ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: User Growth Line Chart (7 cols ~60%) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  User Growth
                </h3>
              </div>
              <Link
                to="/admin/users"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Spline Area Chart */}
            <div className="relative pt-2 pb-2">
              {/* Y-axis Labels & Grid Lines */}
              <div className="space-y-6 text-[10px] text-slate-500 font-mono">
                {['3K', '2K', '1K', '0'].map((val) => (
                  <div key={val} className="flex items-center gap-3">
                    <span className="w-5 text-right">{val}</span>
                    <div className="flex-1 border-b border-white/[0.05]" />
                  </div>
                ))}
              </div>

              {/* Area SVG Overlay */}
              <div className="absolute inset-x-8 top-3 bottom-8 pointer-events-none">
                <svg viewBox="0 0 600 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="userGrowthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area Fill */}
                  <path
                    d="M 20 80 Q 90 70, 115 65 T 205 55 T 300 48 T 400 38 T 495 28 T 580 15 L 580 120 L 20 120 Z"
                    fill="url(#userGrowthGrad)"
                  />

                  {/* Spline Stroke Line */}
                  <path
                    d="M 20 80 Q 90 70, 115 65 T 205 55 T 300 48 T 400 38 T 495 28 T 580 15"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                  />

                  {/* Nodes along the curve */}
                  {[
                    { cx: 20, cy: 80 },
                    { cx: 115, cy: 65 },
                    { cx: 205, cy: 55 },
                    { cx: 300, cy: 48 },
                    { cx: 400, cy: 38 },
                    { cx: 495, cy: 28 },
                  ].map((node, i) => (
                    <circle
                      key={i}
                      cx={node.cx}
                      cy={node.cy}
                      r="4"
                      fill="#c084fc"
                      stroke="#10172B"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Highlighted Peak Node at Nov 29 */}
                  <circle
                    cx="580"
                    cy="15"
                    r="8"
                    fill="#a855f7"
                    opacity="0.3"
                    className="animate-pulse"
                  />
                  <circle
                    cx="580"
                    cy="15"
                    r="5"
                    fill="#ffffff"
                    stroke="#9333ea"
                    strokeWidth="2.5"
                    className="shadow-[0_0_15px_#ffffff]"
                  />
                </svg>
              </div>

              {/* X-axis Date Labels */}
              <div className="flex items-center justify-between pl-8 pr-1 mt-3 text-[11px] font-semibold text-slate-400">
                {data.userGrowth.map((item, index) => (
                  <span
                    key={item.date}
                    onMouseEnter={() => setHoveredGrowthIndex(index)}
                    className={`cursor-pointer transition-colors ${
                      hoveredGrowthIndex === index ? 'text-purple-300 font-bold' : ''
                    }`}
                  >
                    {item.date}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Top Features Radial Donut Ring (5 cols ~40%) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                <Star className="w-4 h-4 fill-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Top Features
              </h3>
            </div>

            {/* Donut Ring & Legend Layout */}
            <div className="flex items-center justify-between gap-6 py-4 px-2">
              {/* Circular SVG Donut Ring */}
              <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#1e293b"
                    strokeWidth="11"
                    fill="transparent"
                  />

                  {/* Arc 1: Timetable 72% (Purple) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#9333ea"
                    strokeWidth="11"
                    strokeDasharray="238.76"
                    strokeDashoffset="66.85"
                    strokeLinecap="round"
                    fill="transparent"
                    className="drop-shadow-[0_0_10px_rgba(147,51,234,0.6)]"
                  />

                  {/* Arc 2: Tasks 18% (Cyan) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#06b6d4"
                    strokeWidth="11"
                    strokeDasharray="238.76"
                    strokeDashoffset="195.78"
                    strokeLinecap="round"
                    fill="transparent"
                    transform="rotate(259.2 50 50)"
                  />

                  {/* Arc 3: Habits 10% (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#10b981"
                    strokeWidth="11"
                    strokeDasharray="238.76"
                    strokeDashoffset="214.88"
                    strokeLinecap="round"
                    fill="transparent"
                    transform="rotate(324 50 50)"
                  />
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-white tracking-tight">
                    {data.topFeatures.timetable}%
                  </span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="flex-1 space-y-3.5 pr-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                    <span className="font-semibold text-slate-200">Timetable</span>
                  </div>
                  <span className="font-bold text-white">{data.topFeatures.timetable}%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    <span className="font-semibold text-slate-200">Tasks</span>
                  </div>
                  <span className="font-bold text-white">{data.topFeatures.tasks}%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <span className="font-semibold text-slate-200">Habits</span>
                  </div>
                  <span className="font-bold text-white">{data.topFeatures.habits}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: RECENT USERS & ACTIVITY LOGS ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Recent Users (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Recent Users
                </h3>
              </div>
              <Link
                to="/admin/users"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5 pt-1">
              {data.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                      {user.initials}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {user.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-400">
                      {user.time}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.04] mt-2">
            <Link
              to="/admin/users"
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
            >
              Manage all registered user accounts →
            </Link>
          </div>
        </div>

        {/* Column 2: Activity Logs (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Activity Logs
                </h3>
              </div>
              <Link
                to="/admin/logs"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5 pt-1">
              {data.activityLogs.map((log) => {
                const IconComponent = log.icon || CheckCircle2;
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${log.color} flex-shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200">
                        {log.title}
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-slate-400">
                      {log.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.04] mt-2">
            <Link
              to="/admin/logs"
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
            >
              View detailed audit trail & database events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
