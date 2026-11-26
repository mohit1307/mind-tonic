import { useState, useEffect } from 'react';
import { Lock, Clock, Calendar, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const DURATION_PRESETS = [
  { label: '15m', val: 15 },
  { label: '30m', val: 30 },
  { label: '45m', val: 45 },
  { label: '1h', val: 60 },
  { label: '1.5h', val: 90 },
  { label: '2h', val: 120 },
  { label: '3h', val: 180 },
];

export default function TaskModal({ isOpen, onClose, onSave, task = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'study',
    priority: 'medium',
    status: 'pending',
    estimatedDuration: 60,
    deadline: '',
    isFixed: false,
    fixedStartTime: '09:00',
    fixedEndTime: '16:00',
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'study',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        estimatedDuration: task.estimatedDuration || 60,
        deadline: task.deadline
          ? new Date(task.deadline).toISOString().slice(0, 16)
          : '',
        isFixed: task.isFixed || false,
        fixedStartTime: task.fixedStartTime || '09:00',
        fixedEndTime: task.fixedEndTime || '16:00',
        tags: task.tags ? task.tags.join(', ') : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'study',
        priority: 'medium',
        status: 'pending',
        estimatedDuration: 60,
        deadline: '',
        isFixed: false,
        fixedStartTime: '09:00',
        fixedEndTime: '16:00',
        tags: '',
      });
    }
    setError('');
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (formData.isFixed && (!formData.fixedStartTime || !formData.fixedEndTime)) {
      setError('Fixed commitments require both start and end times');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        estimatedDuration: Number(formData.estimatedDuration),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        isFixed: formData.isFixed,
        fixedStartTime: formData.isFixed ? formData.fixedStartTime : null,
        fixedEndTime: formData.isFixed ? formData.fixedEndTime : null,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Task Title *"
          name="title"
          required
          placeholder="e.g., Study Java concurrency or College lectures"
          value={formData.title}
          onChange={handleChange}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <textarea
            name="description"
            rows="2"
            placeholder="Add relevant notes, links, or expectations..."
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-primary-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
          />
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1.5 w-full bg-primary-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
            >
              <option value="study">Study / Learning</option>
              <option value="work">Work / Projects</option>
              <option value="personal">Personal</option>
              <option value="health">Health & Fitness</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1.5 w-full bg-primary-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
            >
              <option value="critical">Critical (Must do first)</option>
              <option value="high">High priority</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Duration with presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent-400" />
              Estimated Duration
            </label>
            <span className="text-xs text-accent-300 font-semibold">
              {formData.estimatedDuration} minutes
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {DURATION_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, estimatedDuration: p.val }))
                }
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                  formData.estimatedDuration === p.val
                    ? 'bg-accent-500/20 text-accent-300 border-accent-500/40 font-semibold'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div>
          <Input
            label="Deadline (Optional)"
            type="datetime-local"
            name="deadline"
            icon={Calendar}
            value={formData.deadline}
            onChange={handleChange}
          />
        </div>

        {/* Fixed Commitment Toggle (For College, Exams, Fixed Meetings) */}
        <div className="p-4 rounded-xl bg-surface-light/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                Fixed Commitment (Immovable)
              </span>
              <p className="text-2xs text-slate-400">
                Turn on for fixed events like College, Classes, or Work (e.g. 9:00 AM - 4:00 PM).
              </p>
            </div>
            <input
              type="checkbox"
              name="isFixed"
              checked={formData.isFixed}
              onChange={handleChange}
              className="w-5 h-5 rounded text-accent-500 bg-primary-900 border-white/20 focus:ring-accent-500/50"
            />
          </div>

          {formData.isFixed && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 animate-fade-in">
              <Input
                label="Start Time"
                type="time"
                name="fixedStartTime"
                required
                value={formData.fixedStartTime}
                onChange={handleChange}
              />
              <Input
                label="End Time"
                type="time"
                name="fixedEndTime"
                required
                value={formData.fixedEndTime}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <Input
          label="Tags (Comma separated)"
          name="tags"
          placeholder="coding, exam, health"
          value={formData.tags}
          onChange={handleChange}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
