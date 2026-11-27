const fs = require('fs');
const path = require('path');
const { supabaseDb } = require('../db/supabaseDb');
const ocrProcessor = require('../utils/ocrProcessor');
const ApiError = require('../utils/apiError');

function mapDocToApi(doc) {
  if (!doc) return null;
  return {
    _id: doc.id,
    id: doc.id,
    userId: doc.user_id,
    title: doc.title,
    originalName: doc.original_name,
    fileName: path.basename(doc.file_path || ''),
    filePath: doc.file_path,
    fileType: doc.file_type,
    fileSize: doc.file_size,
    category: doc.category || 'receipt',
    ocrStatus: doc.ocr_status || 'pending',
    ocrText: doc.ocr_text || '',
    ocrData: doc.ocr_data || {},
    isLinkedToExpense: Boolean(doc.is_linked_to_expense),
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

class DocumentService {
  /**
   * Upload and process a new document
   */
  async uploadDocument(userId, file, data = {}) {
    if (!file) throw ApiError.badRequest('No file uploaded');

    const title = data.title?.trim() || file.originalname;
    const category = data.category || 'receipt';
    const isImage = file.mimetype.startsWith('image/');
    const initialOcrStatus = isImage ? 'processing' : 'completed';

    const row = {
      user_id: userId,
      title,
      original_name: file.originalname,
      file_path: file.path,
      file_type: file.mimetype,
      file_size: file.size,
      category,
      ocr_status: initialOcrStatus,
      ocr_text: '',
      ocr_data: {},
    };

    const doc = await supabaseDb.insert('documents', row);

    // Process OCR if image
    if (isImage) {
      try {
        const { ocrText, ocrData } = await ocrProcessor.processFile(file.path, file.mimetype);
        let finalCategory = category;
        if (category === 'other' || category === 'receipt') {
          if (ocrData.detectedCategory === 'college_fee') finalCategory = 'fee_slip';
        }

        const updated = await supabaseDb.update(
          'documents',
          { id: doc.id },
          {
            ocr_text: ocrText,
            ocr_data: ocrData,
            ocr_status: 'completed',
            category: finalCategory,
          }
        );
        return mapDocToApi(updated?.[0] || doc);
      } catch (ocrErr) {
        await supabaseDb.update(
          'documents',
          { id: doc.id },
          {
            ocr_status: 'failed',
            ocr_text: `OCR failed: ${ocrErr.message}`,
          }
        );
      }
    }

    return mapDocToApi(doc);
  }

  /**
   * Get all user documents with optional category and search filters
   */
  async getDocuments(userId, { category, search, ocrStatus } = {}) {
    try {
      let q = supabaseDb.client
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        q = q.eq('category', category);
      }

      if (ocrStatus) {
        q = q.eq('ocr_status', ocrStatus);
      }

      if (search && search.trim()) {
        q = q.or(`title.ilike.%${search.trim()}%,original_name.ilike.%${search.trim()}%`);
      }

      const { data: docs, error } = await q;
      if (error) {
        const fallback = supabaseDb._memoryFindMany('documents', { user_id: userId });
        let list = fallback.data || [];
        if (category && category !== 'all') {
          list = list.filter((d) => d.category === category);
        }
        if (search && search.trim()) {
          const s = search.trim().toLowerCase();
          list = list.filter((d) => (d.title || '').toLowerCase().includes(s) || (d.original_name || '').toLowerCase().includes(s));
        }
        return list.map(mapDocToApi);
      }
      return (docs || []).map(mapDocToApi);
    } catch (_err) {
      const fallback = supabaseDb._memoryFindMany('documents', { user_id: userId });
      return (fallback.data || []).map(mapDocToApi);
    }
  }

  /**
   * Get single document
   */
  async getDocumentById(userId, documentId) {
    const doc = await supabaseDb.findById('documents', documentId, userId);
    if (!doc) throw ApiError.notFound('Document not found');
    return mapDocToApi(doc);
  }

  /**
   * Re-run OCR processing on an existing document
   */
  async reprocessOCR(userId, documentId) {
    const doc = await supabaseDb.findById('documents', documentId, userId);
    if (!doc) throw ApiError.notFound('Document not found');

    if (!doc.file_type.startsWith('image/')) {
      throw ApiError.badRequest('OCR is only supported for image documents (JPG, PNG, WebP)');
    }

    await supabaseDb.update('documents', { id: documentId }, { ocr_status: 'processing' });

    try {
      const { ocrText, ocrData } = await ocrProcessor.processFile(doc.file_path, doc.file_type);
      const updated = await supabaseDb.update(
        'documents',
        { id: documentId },
        {
          ocr_text: ocrText,
          ocr_data: ocrData,
          ocr_status: 'completed',
        }
      );
      return mapDocToApi(updated?.[0] || doc);
    } catch (err) {
      await supabaseDb.update(
        'documents',
        { id: documentId },
        {
          ocr_status: 'failed',
          ocr_text: `OCR failed: ${err.message}`,
        }
      );
      throw ApiError.internal(`OCR processing failed: ${err.message}`);
    }
  }

  /**
   * Delete document and remove physical file from disk
   */
  async deleteDocument(userId, documentId) {
    const doc = await supabaseDb.findById('documents', documentId, userId);
    if (!doc) throw ApiError.notFound('Document not found');

    // Unlink physical file
    try {
      if (fs.existsSync(doc.file_path)) {
        fs.unlinkSync(doc.file_path);
      }
    } catch (err) {
      console.warn(`Could not delete file on disk: ${doc.file_path}`, err.message);
    }

    // Unlink any expense referring to this document
    await supabaseDb.update('expenses', { document_id: documentId }, { document_id: null });

    await supabaseDb.delete('documents', { id: documentId, user_id: userId });
    return { message: 'Document deleted successfully' };
  }
}

module.exports = new DocumentService();
