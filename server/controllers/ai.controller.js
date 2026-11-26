const aiService = require('../services/ai.service');
const apiResponse = require('../utils/apiResponse');

class AIController {
  async chat(req, res, next) {
    try {
      const { message, conversationId } = req.body;
      if (!message || !message.trim()) {
        return apiResponse.error(res, 400, 'Message cannot be empty', 'EMPTY_MESSAGE');
      }

      const result = await aiService.processMessage(
        req.user.id,
        message.trim(),
        conversationId
      );

      return apiResponse.success(res, result, 'Message processed');
    } catch (error) {
      next(error);
    }
  }

  async confirmAction(req, res, next) {
    try {
      const { actionId } = req.params;
      const result = await aiService.confirmAction(req.user.id, actionId);
      return apiResponse.success(res, result, 'Action confirmed and executed');
    } catch (error) {
      next(error);
    }
  }

  async rejectAction(req, res, next) {
    try {
      const { actionId } = req.params;
      const result = await aiService.rejectAction(req.user.id, actionId);
      return apiResponse.success(res, result, 'Action cancelled');
    } catch (error) {
      next(error);
    }
  }

  async getConversations(req, res, next) {
    try {
      const conversations = await aiService.getConversations(req.user.id);
      return apiResponse.success(res, { conversations }, 'Conversations retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req, res, next) {
    try {
      const conversation = await aiService.getConversation(req.user.id, req.params.id);
      return apiResponse.success(res, { conversation }, 'Conversation details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async deleteConversation(req, res, next) {
    try {
      await aiService.deleteConversation(req.user.id, req.params.id);
      return apiResponse.success(res, null, 'Conversation deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AIController();
