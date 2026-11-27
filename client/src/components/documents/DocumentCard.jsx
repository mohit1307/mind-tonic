import {
  FileText,
  FileCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Trash2,
  Receipt,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const CATEGORY_CONFIG = {
  receipt: { label: 'Receipt / Bill', icon: Receipt, badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  fee_challan: { label: 'College Challan', icon: GraduationCap, badge: 'bg-accent-500/15 text-accent-300 border-accent-500/30' },
  academic: { label: 'Academic', icon: FileText, badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  identity: { label: 'Identity', icon: FileCheck, badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  notes: { label: 'Notes', icon: FileText, badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  other: { label: 'Document', icon: FileText, badge: 'bg-white/5 text-slate-400 border-white/10' },
};

export default function DocumentCard({
  document,
  onOpenOCR,
  onDelete,
}) {
  const config = CATEGORY_CONFIG[document.category] || CATEGORY_CONFIG.other;
  const CategoryIcon = config.icon;

  const isImage = document.fileType?.startsWith('image/');
  const ocrData = document.ocrData || {};
  const hasExtractedData = ocrData.amount && !document.isLinkedToExpense;

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <Card className="p-4 sm:p-5 border hover:border-white/20 transition-all space-y-4 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-surface-light border border-white/10 flex items-center justify-center text-accent-400 flex-shrink-0">
            <CategoryIcon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold border ${config.badge}`}>
                {config.label}
              </span>

              {/* OCR status */}
              {document.ocrStatus === 'completed' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-success-500/15 text-success-300 border border-success-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> OCR Ready
                </span>
              )}

              {document.ocrStatus === 'processing' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                  <Clock className="w-2.5 h-2.5" /> OCR Scanning...
                </span>
              )}

              {document.isLinkedToExpense && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Linked to Expense
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white truncate">{document.title}</h4>
            <p className="text-2xs text-slate-500 truncate">
              {document.originalName} • {formatSize(document.fileSize)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(document._id || document.id)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-danger-400 hover:bg-danger-500/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OCR Detected Details Box */}
      {document.ocrStatus === 'completed' && (ocrData.amount || ocrData.vendor) && (
        <div className="p-3 rounded-xl bg-primary-950/60 border border-white/5 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold block">
              OCR Extracted Amount
            </span>
            <span className="text-sm font-bold text-white">
              {ocrData.currency || '₹'} {ocrData.amount ? ocrData.amount.toLocaleString() : 'N/A'}
            </span>
            {ocrData.vendor && (
              <span className="text-2xs text-slate-400 block truncate max-w-xs">
                {ocrData.vendor}
              </span>
            )}
          </div>

          {hasExtractedData && (
            <Button
              size="sm"
              icon={Sparkles}
              onClick={() => onOpenOCR(document)}
              className="bg-amber-500 hover:bg-amber-600 text-primary-950 font-bold"
            >
              Verify & Add Expense
            </Button>
          )}
        </div>
      )}

      {/* Footer info & tags */}
      <div className="flex items-center justify-between text-2xs text-slate-500 pt-1">
        <span>{new Date(document.createdAt).toLocaleDateString()}</span>
        {document.tags?.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden">
            {document.tags.map((t) => (
              <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 truncate">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
