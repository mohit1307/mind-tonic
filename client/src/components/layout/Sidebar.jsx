import { NavLink, useNavigate } from 'react-router-dom';
import {
  Brain,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Target,
  Bot,
  GraduationCap,
  FileText,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const ICON_MAP = {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Target,
  Bot,
  GraduationCap,
  FileText,
  Wallet,
  BarChart3,
  Settings,
};

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/app/dashboard', icon: 'LayoutDashboard' },
  { name: 'My Routine', path: '/app/routine', icon: 'Calendar' },
  { name: 'Tasks', path: '/app/tasks', icon: 'CheckSquare' },
  { name: 'Habits', path: '/app/habits', icon: 'Target' },
  { name: 'AI Assistant', path: '/app/assistant', icon: 'Bot', badge: 'AI' },
  { name: 'Learning', path: '/app/learning', icon: 'GraduationCap' },
  { name: 'Documents', path: '/app/documents', icon: 'FileText' },
  { name: 'Expenses', path: '/app/expenses', icon: 'Wallet' },
  { name: 'Analytics', path: '/app/analytics', icon: 'BarChart3' },
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-primary-950 border-r border-white/5 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
        <NavLink
          to="/app/dashboard"
          className="flex items-center gap-3 overflow-hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-secondary-500 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-white tracking-tight truncate">
              Mind <span className="gradient-text">Tonic</span>
            </span>
          )}
        </NavLink>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm
                transition-all duration-200 group relative
                ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-500/20 to-secondary-500/10 text-white border border-accent-500/30 shadow-glow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
              title={collapsed ? item.name : undefined}
            >
              {Icon && (
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}
                />
              )}

              {!collapsed && (
                <span className="truncate flex-1">{item.name}</span>
              )}

              {!collapsed && item.badge && (
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-300 border border-accent-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed desktop view */}
              {collapsed && (
                <div className="hidden group-hover:block absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-surface-light text-slate-100 text-xs font-medium whitespace-nowrap z-50 shadow-xl border border-white/10 pointer-events-none">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-white/5 bg-primary-950/50">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-surface/50 border border-white/5 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center text-accent-300 font-semibold text-sm flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-2xs text-slate-500 truncate">
                {user?.email || 'user@mindtonic.ai'}
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
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
