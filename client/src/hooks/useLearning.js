import { useState, useEffect, useCallback } from 'react';
import learningService from '../services/learningService';

export function useLearning() {
  const [subjects, setSubjects] = useState([]);
  const [dueReviews, setDueReviews] = useState({ count: 0, topics: [] });
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subjectsData, dueData, statsData, sessionsData] = await Promise.all([
        learningService.getSubjects(),
        learningService.getDueReviews(),
        learningService.getStats(),
        learningService.getSessions({ limit: 10 }),
      ]);
      setSubjects(subjectsData);
      setDueReviews(dueData);
      setStats(statsData);
      setSessions(sessionsData);
    } catch (err) {
      setError(err.message || 'Failed to load learning data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Subject Actions
  const createSubject = async (data) => {
    const newSubject = await learningService.createSubject(data);
    await fetchAll();
    return newSubject;
  };

  const updateSubject = async (id, data) => {
    const updated = await learningService.updateSubject(id, data);
    await fetchAll();
    return updated;
  };

  const deleteSubject = async (id) => {
    await learningService.deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s._id !== id));
    await fetchAll();
  };

  // Topic Actions
  const addTopic = async (subjectId, data) => {
    const newTopic = await learningService.addTopic(subjectId, data);
    await fetchAll();
    return newTopic;
  };

  const updateTopic = async (subjectId, topicId, data) => {
    const updated = await learningService.updateTopic(subjectId, topicId, data);
    await fetchAll();
    return updated;
  };

  const deleteTopic = async (subjectId, topicId) => {
    await learningService.deleteTopic(subjectId, topicId);
    await fetchAll();
  };

  // SM-2 Review Action
  const submitReview = async (subjectId, topicId, quality) => {
    const res = await learningService.reviewTopic(subjectId, topicId, quality);
    // Remove the reviewed topic from local due list immediately
    setDueReviews((prev) => ({
      count: Math.max(0, prev.count - 1),
      topics: prev.topics.filter((t) => t.topicId !== topicId),
    }));
    // Refresh background state
    fetchAll();
    return res;
  };

  // Log Study Session Action
  const logStudySession = async (sessionData) => {
    const session = await learningService.logSession(sessionData);
    await fetchAll();
    return session;
  };

  return {
    subjects,
    dueReviews,
    stats,
    sessions,
    loading,
    error,
    refresh: fetchAll,
    createSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
    submitReview,
    logStudySession,
  };
}

export default useLearning;
