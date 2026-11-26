import { useState, useEffect } from 'react';
import {
  Target,
  Droplets,
  Dumbbell,
  BookOpen,
  Brain,
  Sun,
  Moon,
  Smile,
  Zap,
  Flame,
  AlertCircle,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const ICONS = [
  { name: 'Target', icon: Target },
  { name: 'Droplets', icon: Droplets },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Brain', icon: Brain },
  { name: 'Sun', icon: Sun },
  { name: 'Moon', icon: Moon },
  { name: 'Smile', icon: Smile },
  { name: 'Zap', icon: Zap },
  { name: 'Flame', icon: Flame },
];

const COLORS = [
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

export default function HabitModal({ isOpen, onClose, onSave, habit = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    reminderTime: '08:00',
    color: '#8b5cf6',
    icon: 'Target',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        frequency: habit.frequency || 'daily',
        targetDaysPerWeek: habit.targetDaysPerWeek || 7,
        reminderTime: habit.reminderTime || '08:00',
        color: habit.color || '#8b5cf6',
        icon: habit.icon || 'Target',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        reminderTime: '08:00',
        color: '#8b5cf6',
        icon: 'Target',
      });
    }
    setError('');
  }, [habit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Habit name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        frequency: formData.frequency,
        targetDaysPerWeek: Number(formData.targetDaysPerWeek),
        reminderTime: formData.reminderTime || null,
        color: formData.color,
        icon: formData.icon,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? 'Edit Habit' : 'Create New Habit'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Habit Name *"
          name="name"
          required
          placeholder="e.g., Read Java documentation 30 mins or Drink 3L water"
          value={formData.name}
          onChange={handleChange}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <textarea
            name="description"
            rows="2"
            placeholder="Add motivation, trigger cues, or notes..."
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-primary-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
          />
        </div>

        {/* Icon Picker */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">Icon</label>
          <div className="flex items-center gap-2 flex-wrap">
            {ICONS.map((item) => {
              const Icon = item.icon;
              const isSelected = formData.icon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, icon: item.name }))}
                  className={`p-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-accent-500/20 text-accent-300 border-accent-500 shadow-glow-sm'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                  }`}
                  title={item.name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">Color Accent</label>
          <div className="flex items-center gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color: c }))}
                className={`w-7 h-7 rounded-xl transition-all ${
                  formData.color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-primary-950' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Frequency & Reminder Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300">Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="mt-1.5 w-full bg-primary-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
            >
              <option value="daily">Daily Habit</option>
              <option value="weekly">Weekly Target</option>
            </select>
          </div>

          <Input
            label="Daily Reminder Time"
            type="time"
            name="reminderTime"
            value={formData.reminderTime}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {habit ? 'Update Habit' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
