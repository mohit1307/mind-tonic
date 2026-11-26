const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const Expense = require('../models/Expense');
const ocrProcessor = require('../utils/ocrProcessor');
const ApiError = require('../utils/apiError');

class DocumentService {
  /**
   * Upload and process a new document
   */
  async uploadDocument(userId, file, data = {}) {
    if (!file) throw ApiError.badRequest('No file uploaded');

    const title = data.title?.trim() || file.originalname;
    const category = data.category || 'other';

    // Parse tags if passed as comma-separated or stringified array
    let tags = [];
    if (Array.isArray(data.tags)) {
      tags = data.tags;
    } else if (typeof data.tags === 'string' && data.tags.trim()) {
      try {
        tags = JSON.parse(data.tags);
      } catch {
        tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    // Determine initial OCR status
    const isImage = file.mimetype.startsWith('image/');
    const initialOcrStatus = isImage ? 'processing' : 'not_applicable';

    const doc = await Document.create({
      userId,
      title,
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      category,
      tags,
      ocrStatus: initialOcrStatus,
    });

    // Run OCR asynchronously for images so upload returns quickly or complete if immediate
    if (isImage) {
      try {
        const { ocrText, ocrData } = await ocrProcessor.processFile(file.path, file.mimetype);
        doc.ocrText = ocrText;
        doc.ocrData = ocrData;
        doc.ocrStatus = 'completed';

        // Auto-categorize document if OCR detects high confidence category
        if (category === 'other' && ocrData.detectedCategory === 'college_fee') {
          doc.category = 'fee_challan';
        } else if (category === 'other' && ocrData.amount) {
          doc.category = 'receipt';
        }

        await doc.save();
      } catch (ocrErr) {
        doc.ocrStatus = 'failed';
        doc.ocrText = `OCR failed: ${ocrErr.message}`;
        await doc.save();
      }
    }

    return doc;
  }

  /**
   * Get all user documents with optional category and search filters
   */
  async getDocuments(userId, { category, search, ocrStatus } = {}) {
    const query = { userId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (ocrStatus) {
      query.ocrStatus = ocrStatus;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { originalName: regex }, { tags: regex }, { ocrText: regex }];
    }

    const docs = await Document.find(query).sort({ createdAt: -1 });
    return docs;
  }

  /**
   * Get single document
   */
  async getDocumentById(userId, documentId) {
    const doc = await Document.findOne({ _id: documentId, userId });
    if (!doc) throw ApiError.notFound('Document not found');
    return doc;
  }

  /**
   * Re-run OCR processing on an existing document
   */
  async reprocessOCR(userId, documentId) {
    const doc = await Document.findOne({ _id: documentId, userId });
    if (!doc) throw ApiError.notFound('Document not found');

    if (!doc.fileType.startsWith('image/')) {
      throw ApiError.badRequest('OCR is only supported for image documents (JPG, PNG, WebP)');
    }

    doc.ocrStatus = 'processing';
    await doc.save();

    try {
      const { ocrText, ocrData } = await ocrProcessor.processFile(doc.filePath, doc.fileType);
      doc.ocrText = ocrText;
      doc.ocrData = ocrData;
      doc.ocrStatus = 'completed';
      await doc.save();
      return doc;
    } catch (err) {
      doc.ocrStatus = 'failed';
      doc.ocrText = `OCR failed: ${err.message}`;
      await doc.save();
      throw ApiError.internal(`OCR processing failed: ${err.message}`);
    }
  }

  /**
   * Delete document and remove physical file from disk
   */
  async deleteDocument(userId, documentId) {
    const doc = await Document.findOne({ _id: documentId, userId });
    if (!doc) throw ApiError.notFound('Document not found');

    // Unlink physical file
    try {
      if (fs.existsSync(doc.filePath)) {
        fs.unlinkSync(doc.filePath);
      }
    } catch (err) {
      console.warn(`Could not delete file on disk: ${doc.filePath}`, err.message);
    }

    // Unlink from any linked expense
    if (doc.expenseId) {
      await Expense.findByIdAndUpdate(doc.expenseId, { documentId: null });
    }

    await doc.deleteOne();
    return { message: 'Document deleted successfully' };
  }
}

module.exports = new DocumentService();
