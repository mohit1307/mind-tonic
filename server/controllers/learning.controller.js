const learningService = require('../services/learning.service');
const apiResponse = require('../utils/apiResponse');

class LearningController {
  async getSubjects(req, res, next) {
    try {
      const subjects = await learningService.getSubjects(req.user.id);
      return apiResponse.success(res, { subjects }, 'Subjects retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSubjectById(req, res, next) {
    try {
      const subject = await learningService.getSubjectById(req.user.id, req.params.id);
      return apiResponse.success(res, { subject }, 'Subject details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createSubject(req, res, next) {
    try {
      const subject = await learningService.createSubject(req.user.id, req.body);
      return apiResponse.created(res, { subject }, 'Subject created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateSubject(req, res, next) {
    try {
      const subject = await learningService.updateSubject(req.user.id, req.params.id, req.body);
      return apiResponse.success(res, { subject }, 'Subject updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteSubject(req, res, next) {
    try {
      const result = await learningService.deleteSubject(req.user.id, req.params.id);
      return apiResponse.success(res, result, 'Subject deleted');
    } catch (error) {
      next(error);
    }
  }

  async addTopic(req, res, next) {
    try {
      const topic = await learningService.addTopic(req.user.id, req.params.id, req.body);
      return apiResponse.created(res, { topic }, 'Topic added successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateTopic(req, res, next) {
    try {
      const topic = await learningService.updateTopic(
        req.user.id,
        req.params.id,
        req.params.topicId,
        req.body
      );
      return apiResponse.success(res, { topic }, 'Topic updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTopic(req, res, next) {
    try {
      const result = await learningService.deleteTopic(
        req.user.id,
        req.params.id,
        req.params.topicId
      );
      return apiResponse.success(res, result, 'Topic removed');
    } catch (error) {
      next(error);
    }
  }

  async reviewTopic(req, res, next) {
    try {
      const { quality } = req.body;
      const result = await learningService.reviewTopic(
        req.user.id,
        req.params.id,
        req.params.topicId,
        quality
      );
      return apiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getDueReviews(req, res, next) {
    try {
      const reviews = await learningService.getDueReviews(req.user.id);
      return apiResponse.success(res, reviews, 'Due reviews retrieved');
    } catch (error) {
      next(error);
    }
  }

  async logSession(req, res, next) {
    try {
      const session = await learningService.logStudySession(req.user.id, req.body);
      return apiResponse.created(res, { session }, 'Study session logged');
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req, res, next) {
    try {
      const sessions = await learningService.getStudySessions(req.user.id, req.query);
      return apiResponse.success(res, { sessions }, 'Study sessions retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await learningService.getLearningStats(req.user.id);
      return apiResponse.success(res, { stats }, 'Learning stats retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LearningController();
