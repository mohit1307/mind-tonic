import api from './api';

const documentService = {
  async uploadDocument(formData) {
    const res = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.document || res.document || res.data || res;
  },

  async getDocuments(params = {}) {
    const res = await api.get('/documents', { params });
    return res.data?.documents || res.documents || (Array.isArray(res.data) ? res.data : []) || [];
  },

  async getDocumentById(id) {
    const res = await api.get(`/documents/${id}`);
    return res.data?.document || res.document || res.data || res;
  },

  async reprocessOCR(id) {
    const res = await api.post(`/documents/${id}/ocr`);
    return res.data?.document || res.document || res.data || res;
  },

  async deleteDocument(id) {
    const res = await api.delete(`/documents/${id}`);
    return res.data || res;
  },
};

export default documentService;
