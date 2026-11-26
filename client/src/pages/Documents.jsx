import { useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  Sparkles,
  Receipt,
  GraduationCap,
  Filter,
} from 'lucide-react';
import useDocuments from '../hooks/useDocuments';
import expenseService from '../services/expenseService';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentUploadModal from '../components/documents/DocumentUploadModal';
import OCRReviewModal from '../components/documents/OCRReviewModal';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Documents' },
  { id: 'receipt', label: 'Receipts & Bills' },
  { id: 'fee_challan', label: 'College Challans' },
  { id: 'academic', label: 'Academic & Syllabus' },
  { id: 'identity', label: 'ID & Certificates' },
  { id: 'notes', label: 'Handwritten Notes' },
];

export default function Documents() {
  const {
    documents,
    category,
    setCategory,
    search,
    setSearch,
    loading,
    error,
    refresh,
    uploadDocument,
    deleteDocument,
  } = useDocuments();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [selectedDocForOcr, setSelectedDocForOcr] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const handleOpenOcrReview = (doc) => {
    setSelectedDocForOcr(doc);
    setOcrModalOpen(true);
  };

  const handleConfirmExpenseFromOCR = async (expenseData) => {
    try {
      await expenseService.createFromOCR(expenseData);
      setActionSuccessMsg('Expense created and linked to document successfully!');
      setTimeout(() => setActionSuccessMsg(''), 4000);
      await refresh();
    } catch (err) {
      alert(err.message || 'Failed to create expense');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Documents & OCR Vault
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload bills, college fee challans, and study notes. Intelligent OCR automatically reads and extracts payment amounts.
          </p>
        </div>

        <Button
          icon={Upload}
          size="sm"
          onClick={() => setUploadModalOpen(true)}
        >
          Upload Document
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`
                px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                ${
                  category === tab.id
                    ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents or OCR text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-light border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent-500/50"
          />
        </div>
      </div>

      {/* Success banner */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-success-500/15 border border-success-500/30 text-success-300 text-xs animate-slide-up">
          {actionSuccessMsg}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-sm">
          {error}
        </div>
      )}

      {/* Documents Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader size="lg" />
          <p className="text-sm text-slate-400 mt-3 animate-pulse-soft">
            Loading document repository...
          </p>
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mx-auto text-accent-400 shadow-glow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Documents in this Category</h3>
            <p className="text-sm text-slate-400">
              Upload scanned receipts, fee challans, or academic files to safely organize them with automatic OCR text recognition.
            </p>
          </div>
          <Button
            onClick={() => setUploadModalOpen(true)}
            icon={Upload}
            size="lg"
          >
            Upload Your First Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onOpenOCR={handleOpenOcrReview}
              onDelete={deleteDocument}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={uploadDocument}
      />

      {/* OCR Review & Expense Creation Modal */}
      <OCRReviewModal
        isOpen={ocrModalOpen}
        onClose={() => {
          setOcrModalOpen(false);
          setSelectedDocForOcr(null);
        }}
        document={selectedDocForOcr}
        onConfirmExpense={handleConfirmExpenseFromOCR}
      />
    </div>
  );
}
