import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Settings,
  LogOut,
  Sparkles,
  Shield,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Keyboard shortcut Ctrl + K / Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim().toLowerCase();
    if (q.startsWith('task') || q.includes('todo') || q.includes('dsa') || q.includes('placement')) {
      navigate(`/app/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (q.startsWith('habit') || q.includes('workout') || q.includes('streak')) {
      navigate(`/app/habits`);
    } else if (q.includes('schedule') || q.includes('routine') || q.includes('timetable')) {
      navigate(`/app/routine`);
    } else {
      navigate(`/app/assistant?prompt=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchQuery('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-20 bg-[#080B14]/85 backdrop-blur-xl border-b border-white/[0.04] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Center/Left: Universal Search Bar */}
      <div className="flex-1 max-w-xl">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, habits, or ask anything... (Ctrl + K)"
            className="w-full bg-[#10162B]/90 hover:bg-[#131B33] focus:bg-[#131B33] text-slate-200 placeholder-slate-400/80 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-white/[0.08] focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none shadow-inner"
          />
        </form>
      </div>

      {/* Right: Quick actions, notifications, dark mode, user avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Admin Switch shortcut if user is admin */}
        {(user?.role === 'admin' || user?.email === 'admin@mindtonic.ai') && (
          <button
            onClick={() => navigate('/admin')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(147,51,234,0.25)]"
            title="Open Admin Panel"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin Panel</span>
          </button>
        )}

        {/* Dynamic Notifications Center with badge 3 */}
        <NotificationDropdown />

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl bg-[#10162B] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title={isDarkMode ? 'Dark Theme Active' : 'Switch Theme'}
        >
          {isDarkMode ? <Moon className="w-4 h-4 text-purple-300" /> : <Sun className="w-4 h-4 text-amber-300" />}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-purple-500/30 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-[0_0_15px_rgba(139,92,246,0.35)] flex items-center justify-center">
              <div className="w-full h-full bg-[#10162B] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
              </div>
            </div>
          </button>

          {userDropdownOpen && (
            <div
              onMouseLeave={() => setUserDropdownOpen(false)}
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#10162B] p-2 shadow-2xl border border-white/10 animate-slide-up z-50"
            >
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Mohit Jindal'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@mindtonic.ai'}</p>
              </div>

              {(user?.role === 'admin' || user?.email === 'admin@mindtonic.ai') && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-purple-300 hover:text-purple-200 hover:bg-purple-500/15 rounded-xl transition-colors mb-1"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  Admin Control Panel
                </button>
              )}

              <button
                onClick={() => {
                  navigate('/app/assistant');
                  setUserDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 rounded-xl transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Ask AI Assistant
              </button>

              <button
                onClick={() => {
                  navigate('/app/settings');
                  setUserDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings & Routine
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors mt-1"
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
