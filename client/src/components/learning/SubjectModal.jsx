import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#3b82f6', // Blue
];

export default function SubjectModal({ isOpen, onClose, onSave, subject = null }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [targetHours, setTargetHours] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subject) {
      setName(subject.name || '');
      setCode(subject.code || '');
      setDescription(subject.description || '');
      setColor(subject.color || '#6366f1');
      setTargetHours(subject.targetHours || 20);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setColor('#6366f1');
      setTargetHours(20);
    }
    setError('');
  }, [subject, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Subject name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        color,
        targetHours: Number(targetHours) || 0,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subject ? 'Edit Subject' : 'Add New Subject'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs">
            {error}
          </div>
        )}

        <Input
          label="Subject Name"
          placeholder="e.g. Data Structures & Algorithms, Java, Operating Systems"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Course Code (Optional)"
            placeholder="e.g. CS201"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <Input
            label="Target Goal (Hours)"
            type="number"
            min="0"
            max="500"
            value={targetHours}
            onChange={(e) => setTargetHours(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Theme Color
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-xl transition-all ${
                  color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-primary-950' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description / Syllabus Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key exam dates, textbook reference, or semester focus..."
            className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent-500/50 resize-none transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {subject ? 'Update Subject' : 'Create Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
