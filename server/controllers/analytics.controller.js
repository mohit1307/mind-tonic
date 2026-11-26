const analyticsService = require('../services/analytics.service');
const apiResponse = require('../utils/apiResponse');

class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const overview = await analyticsService.getAnalyticsOverview(req.user.id);
      return apiResponse.success(res, { overview }, 'Analytics overview retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
