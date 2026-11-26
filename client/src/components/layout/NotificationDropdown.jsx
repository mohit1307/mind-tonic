import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Clock,
  Flame,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';

const TYPE_ICONS = {
  reminder: { icon: Clock, color: 'text-accent-400', bg: 'bg-accent-500/10 border-accent-500/20' },
  streak_warning: { icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  missed_task: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  fee_due: { icon: GraduationCap, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  review_due: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  system: { icon: Bell, color: 'text-slate-400', bg: 'bg-white/5 border-white/5' },
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const formatRelativeTime = (dateStr) => {
    const diffSecs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return `${Math.floor(diffSecs / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 relative transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-primary-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-card p-4 shadow-2xl border border-white/10 animate-slide-up z-50">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">Notifications</h4>
              {unreadCount > 0 ? (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-300">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="text-2xs text-slate-500">All caught up</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-2xs text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="py-2 space-y-2 max-h-96 overflow-y-auto scrollbar-hide text-xs">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-1">
                <Bell className="w-6 h-6 mx-auto opacity-40 mb-2" />
                <p>No notifications yet</p>
                <p className="text-2xs">Reminders & streak alerts will appear here</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const config = TYPE_ICONS[notif.type] || TYPE_ICONS.system;
                const Icon = config.icon;

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`
                      p-3 rounded-xl border transition-all cursor-pointer group flex items-start gap-3
                      ${
                        notif.isRead
                          ? 'bg-surface/40 border-white/5 hover:border-white/10'
                          : 'bg-surface-light/80 border-accent-500/30 hover:border-accent-500/50 shadow-sm'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-xl border flex-shrink-0 ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-semibold text-white truncate text-xs">
                          {notif.title}
                        </h5>
                        <span className="text-2xs text-slate-500 flex-shrink-0">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-2xs text-slate-400 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="p-1 rounded-lg text-slate-600 hover:text-danger-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
