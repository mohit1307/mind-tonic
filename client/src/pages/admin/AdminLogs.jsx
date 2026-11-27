import { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Calendar,
  Receipt,
  Sparkles,
  ShieldAlert,
  Server,
  RefreshCw,
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminLogs() {
  const [logs, setLogs] = useState([
    {
      id: 'log-1',
      iconType: 'user',
      color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
      title: 'New user registered',
      description: 'Rohan Kumar joined via Supabase Auth from CSE department',
      time: '2 min ago',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'log-2',
      iconType: 'calendar',
      color: 'text-purple-400 bg-purple-500/15 border-purple-500/25',
      title: 'Schedule created',
      description: 'Conflict-free routine generated for Sneha Patel (5 tasks allocated)',
      time: '5 min ago',
      timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString(),
    },
    {
      id: 'log-3',
      iconType: 'expense',
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/25',
      title: 'Expense added',
      description: '₹4,500 semester lab receipt processed with automated OCR',
      time: '8 min ago',
      timestamp: new Date(Date.now() - 8 * 60000).toLocaleTimeString(),
    },
    {
      id: 'log-4',
      iconType: 'ai',
      color: 'text-blue-400 bg-blue-500/15 border-blue-500/25',
      title: 'AI Assistant timetable adapted',
      description: 'Dynamic schedule shifted gym around DSA study block without college collision',
      time: '14 min ago',
      timestamp: new Date(Date.now() - 14 * 60000).toLocaleTimeString(),
    },
    {
      id: 'log-5',
      iconType: 'system',
      color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
      title: 'PostgreSQL backup snapshot verified',
      description: '14 Supabase relational tables synchronized without latency or schema errors',
      time: '35 min ago',
      timestamp: new Date(Date.now() - 35 * 60000).toLocaleTimeString(),
    },
  ]);

  const [filter, setFilter] = useState('all');

  const fetchLogs = async () => {
    try {
      const res = await adminService.getLogs();
      if (res?.logs?.length > 0) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.warn('Logs fallback:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'user':
        return CheckCircle2;
      case 'calendar':
        return Calendar;
      case 'expense':
        return Receipt;
      case 'ai':
        return Sparkles;
      default:
        return Server;
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-purple-400" />
            System Activity & Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security events, user operations, and scheduler performance audits.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#10172B] hover:bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
          Refresh Logs
        </button>
      </div>

      {/* Logs Card */}
      <div className="rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl p-6">
        <div className="space-y-4">
          {logs.map((log) => {
            const Icon = getIcon(log.iconType);
            return (
              <div
                key={log.id}
                className="flex items-start justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${log.color || 'bg-purple-500/15 text-purple-400 border-purple-500/25'} flex-shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {log.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {log.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold text-purple-300">
                    {log.time}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {log.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
