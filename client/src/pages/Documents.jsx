import { FileText, Upload } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';

export default function Documents() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Document Management & OCR</h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload bills, fee receipts, and certificates with automatic OCR text extraction.
          </p>
        </div>
        <Button icon={Upload}>Upload Document</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={FileText}>Stored Documents</CardTitle>
        </CardHeader>
        <div className="py-12 text-center text-slate-400 text-sm">
          Phase 9 will activate file uploads, OCR processing, and document verification.
        </div>
      </Card>
    </div>
  );
}
