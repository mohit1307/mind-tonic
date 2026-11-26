import api from './api';

const documentService = {
  async uploadDocument(formData) {
    const res = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data.document;
  },

  async getDocuments(params = {}) {
    const res = await api.get('/documents', { params });
    return res.data.data.documents;
  },

  async getDocumentById(id) {
    const res = await api.get(`/documents/${id}`);
    return res.data.data.document;
  },

  async reprocessOCR(id) {
    const res = await api.post(`/documents/${id}/ocr`);
    return res.data.data.document;
  },

  async deleteDocument(id) {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
};

export default documentService;
