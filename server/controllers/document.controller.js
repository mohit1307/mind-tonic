const documentService = require('../services/document.service');
const apiResponse = require('../utils/apiResponse');

class DocumentController {
  async upload(req, res, next) {
    try {
      const document = await documentService.uploadDocument(req.user.id, req.file, req.body);
      return apiResponse.created(res, { document }, 'Document uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const documents = await documentService.getDocuments(req.user.id, req.query);
      return apiResponse.success(res, { documents }, 'Documents retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const document = await documentService.getDocumentById(req.user.id, req.params.id);
      return apiResponse.success(res, { document }, 'Document retrieved');
    } catch (error) {
      next(error);
    }
  }

  async reprocessOCR(req, res, next) {
    try {
      const document = await documentService.reprocessOCR(req.user.id, req.params.id);
      return apiResponse.success(res, { document }, 'OCR reprocessing completed');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await documentService.deleteDocument(req.user.id, req.params.id);
      return apiResponse.success(res, result, 'Document deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
