import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

export default function TopicModal({
  isOpen,
  onClose,
  onSave,
  subject = null,
  topic = null,
}) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [confidence, setConfidence] = useState('low');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topic) {
      setName(topic.name || '');
      setNotes(topic.notes || '');
      setDifficulty(topic.difficulty || 'medium');
      setConfidence(topic.confidence || 'low');
    } else {
      setName('');
      setNotes('');
      setDifficulty('medium');
      setConfidence('low');
    }
    setError('');
  }, [topic, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Topic name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({
        name: name.trim(),
        notes: notes.trim(),
        difficulty,
        confidence,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={topic ? 'Edit Topic' : `Add Topic to ${subject?.name || 'Subject'}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs">
            {error}
          </div>
        )}

        <Input
          label="Topic / Concept Name"
          placeholder="e.g. Binary Search Trees, Virtual Memory, Concurrency Locks"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-accent-500/50"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Confidence Level
            </label>
            <select
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-accent-500/50"
            >
              <option value="low">Low (Needs practice)</option>
              <option value="medium">Medium (Understood)</option>
              <option value="high">High (Mastered)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Key Concepts / Memory Prompts (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Equations, core definitions, or questions to test yourself during Spaced Repetition reviews..."
            className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent-500/50 resize-none transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {topic ? 'Update Topic' : 'Add Topic'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
