import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Sparkles,
  User,
  Settings,
  LogOut,
  Calendar,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getGreeting } from '../../utils/formatters';

const PAGE_TITLES = {
  '/app/dashboard': 'Dashboard',
  '/app/routine': 'My Routine & Timetable',
  '/app/tasks': 'Task Manager',
  '/app/habits': 'Habit Tracker',
  '/app/assistant': 'AI Personal Assistant',
  '/app/learning': 'Learning & Study Plan',
  '/app/documents': 'Documents & OCR',
  '/app/expenses': 'Expense Tracker',
  '/app/analytics': 'Analytics & Insights',
  '/app/settings': 'Settings & Routine Preferences',
};

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const title = PAGE_TITLES[location.pathname] || 'Mind Tonic';
  const greeting = getGreeting();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 h-16 bg-primary-900/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="hidden sm:block text-2xs text-slate-400">
            {greeting}, <span className="text-slate-200 font-medium">{user?.name || 'Friend'}</span> • {currentDate}
          </p>
        </div>
      </div>

      {/* Right: Quick actions, notifications, user avatar */}
      <div className="flex items-center gap-3">
        {/* Ask AI shortcut */}
        <button
          onClick={() => navigate('/app/assistant')}
          className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/20 text-accent-300 text-xs font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-400" />
          <span>Ask AI Assistant</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500 ring-2 ring-primary-900 animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-card p-4 shadow-2xl border border-white/10 animate-slide-up z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h4 className="text-sm font-semibold text-white">Notifications</h4>
                <span className="text-2xs text-accent-400">2 unread</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-surface/80 border border-white/5 hover:border-accent-500/20 transition-colors">
                  <p className="font-medium text-slate-200">Timetable ready</p>
                  <p className="text-slate-400 text-2xs mt-0.5">Your daily schedule was optimized with 3 tasks.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface/80 border border-white/5 hover:border-accent-500/20 transition-colors">
                  <p className="font-medium text-slate-200">Habit reminder</p>
                  <p className="text-slate-400 text-2xs mt-0.5">Remember to drink water & review notes.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-500 to-secondary-500 flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {userDropdownOpen && (
            <div
              onMouseLeave={() => setUserDropdownOpen(false)}
              className="absolute right-0 mt-2 w-52 rounded-2xl glass-card p-2 shadow-2xl border border-white/10 animate-slide-up z-50"
            >
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-2xs text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  navigate('/app/settings');
                  setUserDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings & Preferences
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 rounded-xl transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
