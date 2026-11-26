import api from './api';

const learningService = {
  // ── Subjects ──
  async getSubjects() {
    const res = await api.get('/learning/subjects');
    return res.data.data.subjects;
  },

  async getSubjectById(id) {
    const res = await api.get(`/learning/subjects/${id}`);
    return res.data.data.subject;
  },

  async createSubject(data) {
    const res = await api.post('/learning/subjects', data);
    return res.data.data.subject;
  },

  async updateSubject(id, data) {
    const res = await api.put(`/learning/subjects/${id}`, data);
    return res.data.data.subject;
  },

  async deleteSubject(id) {
    const res = await api.delete(`/learning/subjects/${id}`);
    return res.data;
  },

  // ── Topics ──
  async addTopic(subjectId, data) {
    const res = await api.post(`/learning/subjects/${subjectId}/topics`, data);
    return res.data.data.topic;
  },

  async updateTopic(subjectId, topicId, data) {
    const res = await api.put(`/learning/subjects/${subjectId}/topics/${topicId}`, data);
    return res.data.data.topic;
  },

  async deleteTopic(subjectId, topicId) {
    const res = await api.delete(`/learning/subjects/${subjectId}/topics/${topicId}`);
    return res.data;
  },

  // ── Active Recall & SM-2 ──
  async reviewTopic(subjectId, topicId, quality) {
    const res = await api.post(`/learning/subjects/${subjectId}/topics/${topicId}/review`, {
      quality,
    });
    return res.data;
  },

  async getDueReviews() {
    const res = await api.get('/learning/reviews/due');
    return res.data.data;
  },

  // ── Study Sessions & Timer ──
  async logSession(data) {
    const res = await api.post('/learning/sessions', data);
    return res.data.data.session;
  },

  async getSessions(params = {}) {
    const res = await api.get('/learning/sessions', { params });
    return res.data.data.sessions;
  },

  // ── Analytics ──
  async getStats() {
    const res = await api.get('/learning/stats');
    return res.data.data.stats;
  },
};

export default learningService;
