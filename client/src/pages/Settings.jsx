import { useState } from 'react';
import {
  User,
  Clock,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sparkles,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card, { CardHeader, CardTitle } from '../components/common/Card';

export default function Settings() {
  const { user, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState('routine');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);

  // Profile & Routine Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    timezone: user?.preferences?.timezone || 'Asia/Kolkata',
    workingHoursStart: user?.preferences?.workingHoursStart || '09:00',
    workingHoursEnd: user?.preferences?.workingHoursEnd || '22:00',
    breakDuration: user?.preferences?.breakDuration || 15,
    sleepStart: user?.preferences?.sleepStart || '23:00',
    sleepEnd: user?.preferences?.sleepEnd || '07:00',
    notificationsEnabled: user?.preferences?.notificationsEnabled ?? true,
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      await updateProfile({
        name: profileForm.name,
        preferences: {
          timezone: profileForm.timezone,
          workingHoursStart: profileForm.workingHoursStart,
          workingHoursEnd: profileForm.workingHoursEnd,
          breakDuration: Number(profileForm.breakDuration),
          sleepStart: profileForm.sleepStart,
          sleepEnd: profileForm.sleepEnd,
          notificationsEnabled: profileForm.notificationsEnabled,
        },
      });
      setProfileSuccess('Settings and routine preferences updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Account & Routine Settings</h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure your personal working hours, sleep windows, and security preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('routine')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'routine'
              ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Routine & Work Hours
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'security'
              ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security
        </button>
      </div>

      {/* Tab: Routine & Timetable Preferences */}
      {activeTab === 'routine' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {profileSuccess && (
            <div className="p-4 rounded-xl bg-success-500/15 border border-success-500/30 text-success-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-4 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{profileError}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle icon={Clock}>Working & Active Hours</CardTitle>
            </CardHeader>
            <p className="text-xs text-slate-400 mb-4">
              The AI Timetable Generator schedules flexible study and work sessions inside these working boundaries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Working Hours Start"
                type="time"
                name="workingHoursStart"
                value={profileForm.workingHoursStart}
                onChange={handleProfileChange}
              />
              <Input
                label="Working Hours End"
                type="time"
                name="workingHoursEnd"
                value={profileForm.workingHoursEnd}
                onChange={handleProfileChange}
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle icon={Moon}>Sleep Window & Breaks</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Sleep Bedtime"
                type="time"
                name="sleepStart"
                value={profileForm.sleepStart}
                onChange={handleProfileChange}
              />
              <Input
                label="Wakeup Time"
                type="time"
                name="sleepEnd"
                value={profileForm.sleepEnd}
                onChange={handleProfileChange}
              />
              <Input
                label="Break Duration (min)"
                type="number"
                min="5"
                max="60"
                name="breakDuration"
                value={profileForm.breakDuration}
                onChange={handleProfileChange}
              />
            </div>
          </Card>

          <Button type="submit" loading={saving} icon={Save}>
            Save Routine Preferences
          </Button>
        </form>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {profileSuccess && (
            <div className="p-4 rounded-xl bg-success-500/15 border border-success-500/30 text-success-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle icon={User}>Personal Details</CardTitle>
            </CardHeader>

            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
              />

              <div>
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="mt-1.5 w-full bg-primary-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                />
                <span className="text-2xs text-slate-500 mt-1 block">Email cannot be changed directly</span>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">Timezone</label>
                <select
                  name="timezone"
                  value={profileForm.timezone}
                  onChange={handleProfileChange}
                  className="mt-1.5 w-full bg-primary-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                  <option value="UTC">UTC (GMT)</option>
                  <option value="America/New_York">America/New York (EST - UTC-5)</option>
                  <option value="America/Los_Angeles">America/Los Angeles (PST - UTC-8)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                </select>
              </div>
            </div>
          </Card>

          <Button type="submit" loading={saving} icon={Save}>
            Save Profile
          </Button>
        </form>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <form onSubmit={handleSavePassword} className="space-y-6">
          {passwordSuccess && (
            <div className="p-4 rounded-xl bg-success-500/15 border border-success-500/30 text-success-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-4 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{passwordError}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle icon={Shield}>Update Password</CardTitle>
            </CardHeader>

            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                required
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
              />

              <Input
                label="New Password"
                type="password"
                name="newPassword"
                required
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
              />

              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                required
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </Card>

          <Button type="submit" loading={saving} icon={Shield}>
            Update Password
          </Button>
        </form>
      )}
    </div>
  );
}
