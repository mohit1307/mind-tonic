import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  ExternalLink,
  LogOut,
  Settings,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function AdminTopBar({ onMenuClick }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/admin/users?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-20 bg-[#080B14]/85 backdrop-blur-xl border-b border-white/[0.04] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Center/Left: Search Bar */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#10162B]/90 hover:bg-[#131B33] focus:bg-[#131B33] text-slate-200 placeholder-slate-400/70 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-white/[0.08] focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Switch to Website Button */}
        <button
          onClick={() => navigate('/app/dashboard')}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all shadow-sm"
          title="Open Website Student View"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Website App</span>
        </button>

        {/* Notification Bell with red badge 1 */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 rounded-xl bg-[#10162B] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]">
              1
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div
              onMouseLeave={() => setNotificationsOpen(false)}
              className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#10162B] border border-white/10 p-3 shadow-2xl z-50 animate-slide-up"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                <span className="text-xs font-bold text-white">System Alert</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-slate-200">
                <p className="font-semibold text-purple-300">New User Peak Detected</p>
                <p className="text-[11px] text-slate-400 mt-1">2,980 active students synchronized across routine tables.</p>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl bg-[#10162B] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title={isDarkMode ? 'Dark Theme Active' : 'Switch Theme'}
        >
          {isDarkMode ? <Moon className="w-4 h-4 text-purple-300" /> : <Sun className="w-4 h-4 text-amber-300" />}
        </button>

        {/* Admin Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-purple-500/30 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-[0_0_15px_rgba(139,92,246,0.35)] flex items-center justify-center">
              <div className="w-full h-full bg-[#10162B] rounded-full flex items-center justify-center text-white text-xs font-bold">
                AD
              </div>
            </div>
          </button>

          {dropdownOpen && (
            <div
              onMouseLeave={() => setDropdownOpen(false)}
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#10162B] p-2 shadow-2xl border border-white/10 animate-slide-up z-50"
            >
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-xs font-bold text-white">Platform Administrator</p>
                <p className="text-[11px] text-purple-400">admin@mindtonic.ai</p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/admin/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Admin Settings
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/app/dashboard');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Go to Website App
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
