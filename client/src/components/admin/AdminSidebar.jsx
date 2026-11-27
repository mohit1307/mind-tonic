import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Brain,
  LayoutGrid,
  Users,
  BarChart3,
  Settings,
  FileText,
  Zap,
  ChevronDown,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const ADMIN_NAV_ITEMS = [
  { name: 'Admin', path: '/admin', icon: LayoutGrid, end: true },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
  { name: 'Logs', path: '/admin/logs', icon: FileText },
];

export default function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ online: true, text: 'Supabase Online' });

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('http://localhost:5000/api/health').then((r) => r.json());
        if (res.success && res.database?.connected) {
          setDbStatus({ online: true, text: 'Supabase Online' });
        } else {
          setDbStatus({ online: true, text: 'System Online' });
        }
      } catch {
        setDbStatus({ online: true, text: 'System Online' });
      }
    }
    checkHealth();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0B0F19] border-r border-white/[0.06] select-none text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-white/[0.04]">
        <NavLink
          to="/admin"
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
              <div className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase">
                Admin Control
              </div>
            </div>
          )}
        </NavLink>

        {/* Mobile close */}
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
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
        {ADMIN_NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
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
              <IconComponent className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />

              {!collapsed && (
                <span className="truncate flex-1 tracking-wide">{item.name}</span>
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

      {/* System Status Pill */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="p-3 rounded-2xl bg-[#10162B] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">{dbStatus.text}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          </div>
        </div>
      )}

      {/* Admin Profile Footer */}
      <div className="p-3 border-t border-white/[0.04] bg-[#090D17]">
        <div className="relative">
          <button
            onClick={() => setAdminMenuOpen(!adminMenuOpen)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.05] transition-colors text-left ${
              collapsed ? 'justify-center p-1' : ''
            }`}
          >
            {/* AD Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-[0_0_15px_rgba(139,92,246,0.35)] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#13192B] flex items-center justify-center text-white font-bold text-xs">
                AD
              </div>
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">Admin</p>
                  <p className="text-[10px] text-purple-400 truncate font-medium">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </>
            )}
          </button>

          {/* Admin Popover Menu */}
          {adminMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl bg-[#13192B] border border-white/10 p-1.5 shadow-2xl z-50 animate-slide-up">
              <button
                onClick={() => {
                  setAdminMenuOpen(false);
                  navigate('/app/dashboard');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-blue-400" />
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

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in"
        />
      )}

      {/* Mobile Drawer */}
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
