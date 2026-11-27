import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Brain,
  Home,
  Calendar,
  CheckSquare,
  Flame,
  Sparkles,
  GraduationCap,
  Folder,
  Wallet,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useTaskContext } from '../../context/TaskContext';

const ICON_MAP = {
  Home,
  Calendar,
  CheckSquare,
  Flame,
  Sparkles,
  GraduationCap,
  Folder,
  Wallet,
  BarChart2,
  Settings,
};

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/app/dashboard', icon: 'Home' },
  { name: 'My Routine', path: '/app/routine', icon: 'Calendar' },
  { name: 'Tasks', path: '/app/tasks', icon: 'CheckSquare', badgeCount: 3 },
  { name: 'Habits', path: '/app/habits', icon: 'Flame' },
  { name: 'AI Assistant', path: '/app/assistant', icon: 'Sparkles' },
  { name: 'Learning', path: '/app/learning', icon: 'GraduationCap' },
  { name: 'Documents', path: '/app/documents', icon: 'Folder' },
  { name: 'Expenses', path: '/app/expenses', icon: 'Wallet' },
  { name: 'Analytics', path: '/app/analytics', icon: 'BarChart2' },
  { name: 'Settings', path: '/app/settings', icon: 'Settings' },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Live Task Pending Counter
  let pendingCount = 3;
  try {
    const taskContext = useTaskContext();
    if (taskContext?.stats?.pending !== undefined) {
      pendingCount = taskContext.stats.pending;
    }
  } catch {
    // fallback
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0B0F19] border-r border-white/[0.06] select-none text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-white/[0.04]">
        <NavLink
          to="/app/dashboard"
          className="flex items-center gap-3 overflow-hidden group"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-0.5 shadow-[0_0_20px_rgba(139,92,246,0.4)] flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0B0F19]/60 backdrop-blur-sm rounded-[14px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-base text-white tracking-tight leading-tight">
                Mind Tonic
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wider">
                Plan • Focus • Achieve
              </div>
            </div>
          )}
        </NavLink>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium
                transition-all duration-200 group relative
                ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_25px_rgba(79,70,229,0.45)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
              title={collapsed ? item.name : undefined}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}
                />
              )}

              {!collapsed && (
                <span className="truncate flex-1 tracking-wide">{item.name}</span>
              )}

              {!collapsed && (item.name === 'Tasks' ? pendingCount > 0 : Boolean(item.badgeCount)) && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                  {item.name === 'Tasks' ? pendingCount : item.badgeCount}
                </span>
              )}

              {/* Tooltip on collapsed desktop view */}
              {collapsed && (
                <div className="hidden group-hover:block absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#13192B] text-slate-100 text-xs font-medium whitespace-nowrap z-50 shadow-2xl border border-white/10 pointer-events-none">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Stay Productive Streak Card */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#131930] to-[#0E1324] border border-indigo-500/20 relative overflow-hidden shadow-lg group">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">👑</span>
              <span className="text-xs font-bold text-white tracking-wide">Stay Productive!</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              You're on a 7 day streak 🎉
            </p>
            {/* Glowing neon purple sparkline */}
            <div className="mt-2 h-7 w-full">
              <svg viewBox="0 0 100 24" className="w-full h-full stroke-purple-400 fill-none" strokeWidth="2.5" strokeLinecap="round">
                <path d="M0 20 Q 25 18, 40 12 T 75 8 T 100 3" />
                <path d="M0 20 Q 25 18, 40 12 T 75 8 T 100 3 L 100 24 L 0 24 Z" className="fill-purple-500/10 stroke-none" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* User Footer */}
      <div className="p-3 border-t border-white/[0.04] bg-[#090D17]">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.05] transition-colors text-left ${
              collapsed ? 'justify-center p-1' : ''
            }`}
          >
            {/* User Avatar with circular purple glow */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-[0_0_15px_rgba(139,92,246,0.3)] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#13192B] flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                <span className="text-purple-300">MJ</span>
              </div>
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || 'Mohit Jindal'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">Student</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </>
            )}
          </button>

          {/* User Popover Menu */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl bg-[#13192B] border border-white/10 p-1.5 shadow-2xl z-50 animate-slide-up">
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/app/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
