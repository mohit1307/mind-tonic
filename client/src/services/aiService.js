import api from './api';

export const aiService = {
  /**
   * Send a message to the AI assistant
   */
  async sendMessage(message, conversationId = null) {
    const response = await api.post('/ai/chat', { message, conversationId });
    return response.data;
  },

  /**
   * Confirm and execute a pending structured action
   */
  async confirmAction(actionId) {
    const response = await api.post(`/ai/actions/${actionId}/confirm`);
    return response.data;
  },

  /**
   * Reject / Cancel a pending action
   */
  async rejectAction(actionId) {
    const response = await api.post(`/ai/actions/${actionId}/reject`);
    return response.data;
  },

  /**
   * Get all conversations
   */
  async getConversations() {
    const response = await api.get('/ai/conversations');
    return response.data.conversations;
  },

  /**
   * Get single conversation with full message history
   */
  async getConversation(id) {
    const response = await api.get(`/ai/conversations/${id}`);
    return response.data.conversation;
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(id) {
    const response = await api.delete(`/ai/conversations/${id}`);
    return response.data;
  },
};

export default aiService;
