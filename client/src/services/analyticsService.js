import api from './api';

const analyticsService = {
  async getOverview() {
    const res = await api.get('/analytics/overview');
    return res.data.data.overview;
  },
};

export default analyticsService;
