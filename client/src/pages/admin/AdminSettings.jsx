import { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Database,
  Cpu,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    aiAssistantEnabled: true,
    maxDailyTasksPerUser: 50,
    backupSchedule: 'Daily at 02:00 AM',
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await adminService.getSettings();
        if (res?.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.warn('Admin settings load:', err);
      }
    }
    loadSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-purple-400" />
            Website & Platform Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure system-wide toggles, access rules, database sync, and AI parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Changes...' : 'Save Configuration'}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4" />
          Platform configuration updated successfully.
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Core Website Toggles */}
        <div className="p-6 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.05]">
            <Shield className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Access Control & Operations
            </h3>
          </div>

          <div className="space-y-4">
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <h4 className="text-xs font-bold text-white">Maintenance Mode</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Temporarily lock non-admin user access for platform updates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('maintenanceMode')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.maintenanceMode ? 'bg-rose-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Registration Open */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <h4 className="text-xs font-bold text-white">Student Sign-Ups Open</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Allow new students to register accounts through Supabase Auth.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('registrationOpen')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.registrationOpen ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.registrationOpen ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* AI Assistant Enabled */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <h4 className="text-xs font-bold text-white">AI Assistant Engine</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enable natural language timetable adaptation and Gemini chat assistance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('aiAssistantEnabled')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.aiAssistantEnabled ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.aiAssistantEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Database & System Environment */}
        <div className="p-6 rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.05]">
            <Database className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Database & Infrastructure
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Database Engine</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Supabase PostgreSQL 15
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                14 relational tables with RLS and foreign key cascade rules active.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Authentication</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                  Supabase Auth JWT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cryptographic signature verification on incoming Bearer headers.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Background Cron Jobs</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  3 Active Daemons
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Task Reminders (*/15m), Habit Streaks (20:00), College Fee Dues (09:00).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
