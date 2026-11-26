import { useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const CATEGORIES = [
  { id: 'receipt', label: 'Receipt / Bill (Auto OCR)' },
  { id: 'fee_challan', label: 'College Fee Challan' },
  { id: 'academic', label: 'Academic & Syllabus' },
  { id: 'identity', label: 'ID & Certificates' },
  { id: 'notes', label: 'Handwritten Notes' },
  { id: 'other', label: 'General Document' },
];

export default function DocumentUploadModal({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('receipt');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim() || file.name);
    formData.append('category', category);
    formData.append('tags', tags);

    try {
      await onUpload(formData);
      onClose();
      setFile(null);
      setTitle('');
      setTags('');
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document or Receipt"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* File Dropzone */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-accent-500/40 transition-colors text-center bg-primary-950/40 relative">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mx-auto text-accent-400 mb-3">
            <Upload className="w-6 h-6" />
          </div>
          {file ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white truncate max-w-xs mx-auto">
                {file.name}
              </p>
              <p className="text-2xs text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB • Click or drag to change
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                Drag & drop your receipt or document here
              </p>
              <p className="text-2xs text-slate-400">
                Supports JPG, PNG, WebP (automatic OCR extraction) and PDF (up to 10MB)
              </p>
            </div>
          )}
        </div>

        <Input
          label="Document Title"
          placeholder="e.g. Semester 4 Tuition Challan, Amazon Books Receipt"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-light border border-white/10 text-white text-sm focus:outline-none focus:border-accent-500/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Tags (Comma-separated)"
            placeholder="college, fees, 2026"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Upload}>
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
